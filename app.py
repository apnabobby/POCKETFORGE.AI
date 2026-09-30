# Stage 4 - Complete Production Flask Server with Dark Factory Hook
# Contributors: Google AI Studio, BAND

import os
import re
import sqlite3
from flask import Flask, jsonify, request, render_template

app = Flask(__name__, template_folder="templates", static_folder="static")

# Support Vercel serverless writable path
if os.environ.get("VERCEL"):
    DB_PATH = "/tmp/tablekeeper.db"
else:
    DB_PATH = os.environ.get("DATABASE_PATH", "tablekeeper_stage4.db")

VALID_STATUSES = {"AVAILABLE", "RESERVED", "OCCUPIED", "DIRTY"}

def sanitize_phone(phone_str: str) -> str:
    if not phone_str:
        return ""
    clean = re.sub(r"[^\d+]", "", phone_str.strip())
    if not clean.startswith("+"):
        clean = "+" + clean if len(clean) >= 10 else clean
    if re.match(r"^\+[1-9]\d{6,14}$", clean):
        return clean
    return ""

def get_db_connection():
    # Use timeout=20.0 to prevent sqlite concurrency locks under heavy dark factory load
    conn = sqlite3.connect(DB_PATH, timeout=20.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS stations (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            server_name TEXT NOT NULL
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tables (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            table_number TEXT UNIQUE NOT NULL,
            capacity INTEGER NOT NULL,
            station_id TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'AVAILABLE',
            FOREIGN KEY (station_id) REFERENCES stations (id)
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reservations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            table_id INTEGER NOT NULL,
            guest_name TEXT NOT NULL,
            guest_phone TEXT NOT NULL,
            party_size INTEGER NOT NULL,
            reservation_time TEXT NOT NULL,
            notes TEXT,
            status TEXT NOT NULL DEFAULT 'CONFIRMED',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (table_id) REFERENCES tables (id)
        )
    """)
    cursor.execute("SELECT COUNT(*) FROM stations")
    if cursor.fetchone()[0] == 0:
        cursor.executemany("""
            INSERT INTO stations (id, name, server_name) VALUES (?, ?, ?)
        """, [
            ("terrace", "Terrasse Royale", "Jean-Luc"),
            ("main_salon", "Grand Salon", "Amélie"),
            ("mezzanine", "Mezzanine Étoilée", "Henri"),
        ])
        cursor.executemany("""
            INSERT INTO tables (table_number, capacity, station_id, status) VALUES (?, ?, ?, ?)
        """, [
            ("T-101", 2, "terrace", "AVAILABLE"),
            ("T-102", 4, "terrace", "AVAILABLE"),
            ("T-103", 2, "terrace", "OCCUPIED"),
            ("M-201", 4, "main_salon", "AVAILABLE"),
            ("M-202", 6, "main_salon", "RESERVED"),
            ("M-203", 8, "main_salon", "AVAILABLE"),
            ("Z-301", 2, "mezzanine", "DIRTY"),
            ("Z-302", 4, "mezzanine", "AVAILABLE"),
        ])
    conn.commit()
    conn.close()

# Auto initialize DB
init_db()

@app.route("/", methods=["GET"])
def index():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM stations ORDER BY name")
    stations = [dict(r) for r in cursor.fetchall()]
    cursor.execute("""
        SELECT t.*, s.name as station_name, s.server_name 
        FROM tables t 
        JOIN stations s ON t.station_id = s.id 
        ORDER BY t.table_number
    """)
    tables = [dict(r) for r in cursor.fetchall()]
    cursor.execute("""
        SELECT r.*, t.table_number 
        FROM reservations r 
        JOIN tables t ON r.table_id = t.id 
        WHERE r.status = 'CONFIRMED' 
        ORDER BY r.reservation_time ASC
    """)
    reservations = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return render_template("index.html", stations=stations, tables=tables, reservations=reservations)

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "L'Étoile Noire Tablekeeper",
        "stage": "stage-4",
        "deployment": "production",
        "contributors": ["Google AI Studio", "BAND"]
    })

@app.route("/api/tables", methods=["GET"])
def get_tables():
    conn = get_db_connection()
    cursor = conn.cursor()
    station = request.args.get("station")
    if station:
        cursor.execute("SELECT t.*, s.name as station_name FROM tables t JOIN stations s ON t.station_id = s.id WHERE t.station_id = ?", (station,))
    else:
        cursor.execute("SELECT t.*, s.name as station_name FROM tables t JOIN stations s ON t.station_id = s.id ORDER BY t.table_number")
    rows = cursor.fetchall()
    tables = [dict(r) for r in rows]
    conn.close()
    return jsonify({"tables": tables, "count": len(tables)})

@app.route("/api/tables/<int:table_id>", methods=["GET"])
def get_table(table_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT t.*, s.name as station_name FROM tables t JOIN stations s ON t.station_id = s.id WHERE t.id = ?", (table_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return jsonify({"error": "Table not found"}), 404
    return jsonify(dict(row))

@app.route("/api/tables/<int:table_id>/status", methods=["POST"])
def update_table_status(table_id):
    data = request.get_json() or {}
    new_status = data.get("status", "").upper()
    if new_status not in VALID_STATUSES:
        return jsonify({"error": f"Invalid status '{new_status}'"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tables WHERE id = ?", (table_id,))
    table = cursor.fetchone()
    if not table:
        conn.close()
        return jsonify({"error": "Table not found"}), 404

    cursor.execute("UPDATE tables SET status = ? WHERE id = ?", (new_status, table_id))
    conn.commit()
    cursor.execute("SELECT t.*, s.name as station_name FROM tables t JOIN stations s ON t.station_id = s.id WHERE t.id = ?", (table_id,))
    updated = dict(cursor.fetchone())
    conn.close()
    return jsonify({"message": "Status updated", "table": updated})

@app.route("/api/reservations", methods=["GET"])
def list_reservations():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT r.*, t.table_number 
        FROM reservations r 
        JOIN tables t ON r.table_id = t.id 
        ORDER BY r.id DESC
    """)
    rows = cursor.fetchall()
    reservations = [dict(r) for r in rows]
    conn.close()
    return jsonify({"reservations": reservations, "count": len(reservations)})

@app.route("/api/reservations", methods=["POST"])
def create_reservation():
    data = request.get_json() or {}
    table_id = data.get("table_id")
    guest_name = data.get("guest_name", "").strip()
    raw_phone = data.get("guest_phone", "").strip()
    party_size = data.get("party_size")
    reservation_time = data.get("reservation_time", "").strip()
    notes = data.get("notes", "")

    if not all([table_id, guest_name, raw_phone, party_size, reservation_time]):
        return jsonify({"error": "Missing required fields"}), 400

    sanitized_phone = sanitize_phone(raw_phone)
    if not sanitized_phone:
        return jsonify({"error": "Invalid phone format. Please use valid international E.164 phone."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("BEGIN IMMEDIATE")
        cursor.execute("SELECT * FROM tables WHERE id = ?", (table_id,))
        table = cursor.fetchone()
        if not table:
            conn.rollback()
            conn.close()
            return jsonify({"error": "Table not found"}), 404

        if party_size > table["capacity"]:
            conn.rollback()
            conn.close()
            return jsonify({"error": f"Party size {party_size} exceeds table capacity {table['capacity']}"}), 400

        if table["status"] in ("OCCUPIED", "RESERVED"):
            conn.rollback()
            conn.close()
            return jsonify({"error": f"Cannot reserve table currently marked {table['status']}"}), 409

        cursor.execute("""
            INSERT INTO reservations (table_id, guest_name, guest_phone, party_size, reservation_time, notes, status)
            VALUES (?, ?, ?, ?, ?, ?, 'CONFIRMED')
        """, (table_id, guest_name, sanitized_phone, party_size, reservation_time, notes))
        res_id = cursor.lastrowid
        cursor.execute("UPDATE tables SET status = 'RESERVED' WHERE id = ?", (table_id,))
        conn.commit()

        cursor.execute("SELECT r.*, t.table_number FROM reservations r JOIN tables t ON r.table_id = t.id WHERE r.id = ?", (res_id,))
        created = dict(cursor.fetchone())
        conn.close()
        return jsonify({"message": "Reservation confirmed", "reservation": created}), 201
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 500

@app.route("/api/reservations/<int:reservation_id>", methods=["DELETE"])
def cancel_reservation(reservation_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM reservations WHERE id = ?", (reservation_id,))
    res = cursor.fetchone()
    if not res:
        conn.close()
        return jsonify({"error": "Reservation not found"}), 404

    table_id = res["table_id"]
    cursor.execute("UPDATE reservations SET status = 'CANCELLED' WHERE id = ?", (reservation_id,))
    cursor.execute("UPDATE tables SET status = 'AVAILABLE' WHERE id = ?", (table_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": f"Reservation {reservation_id} cancelled."})

@app.route("/api/stations", methods=["GET"])
def get_stations():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM stations ORDER BY name")
    stations = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return jsonify({"stations": stations})

@app.route("/api/stations", methods=["POST"])
def add_station():
    data = request.get_json() or {}
    station_id = data.get("id", "").strip().lower()
    name = data.get("name", "").strip()
    server_name = data.get("server_name", "").strip()
    if not all([station_id, name, server_name]):
        return jsonify({"error": "Station id, name, and server_name required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO stations (id, name, server_name) VALUES (?, ?, ?)", (station_id, name, server_name))
        conn.commit()
        cursor.execute("SELECT * FROM stations WHERE id = ?", (station_id,))
        created = dict(cursor.fetchone())
        conn.close()
        return jsonify({"message": "Station added", "station": created}), 201
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"error": f"Station '{station_id}' already exists"}), 409

@app.route("/api/stations/<string:station_id>", methods=["DELETE"])
def remove_station(station_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM stations WHERE id = ?", (station_id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"error": "Station not found"}), 404

    cursor.execute("UPDATE tables SET station_id = 'main_salon' WHERE station_id = ?", (station_id,))
    cursor.execute("DELETE FROM stations WHERE id = ?", (station_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": f"Station '{station_id}' deleted; tables moved to main_salon."})

# --- Dark Factory Stress Trigger Endpoint ---
@app.route("/api/dark-factory/run", methods=["POST"])
def run_dark_factory_api():
    from dark_factory import DarkFactoryRunner
    runner = DarkFactoryRunner()
    results = runner.run_all_vectors()
    return jsonify(results)

if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
