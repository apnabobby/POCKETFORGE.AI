# Stage 2 - Flask server serving floorplan UI & REST APIs
# Contributors: Google AI Studio, BAND

import os
import sqlite3
from flask import Flask, jsonify, request, render_template

app = Flask(__name__, template_folder="templates", static_folder="static")
DB_PATH = os.environ.get("DATABASE_PATH", "tablekeeper_stage2.db")
VALID_STATUSES = {"AVAILABLE", "RESERVED", "OCCUPIED", "DIRTY"}

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
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
    conn.close()
    return render_template("index.html", stations=stations, tables=tables)

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "L'Étoile Noire Tablekeeper",
        "stage": "stage-2",
        "contributors": ["Google AI Studio", "BAND"]
    })

@app.route("/api/tables", methods=["GET"])
def get_tables():
    conn = get_db_connection()
    cursor = conn.cursor()
    station_filter = request.args.get("station")
    if station_filter:
        cursor.execute("SELECT t.*, s.name as station_name FROM tables t JOIN stations s ON t.station_id = s.id WHERE t.station_id = ? ORDER BY t.table_number", (station_filter,))
    else:
        cursor.execute("SELECT t.*, s.name as station_name FROM tables t JOIN stations s ON t.station_id = s.id ORDER BY t.table_number")
    rows = cursor.fetchall()
    tables = [dict(row) for row in rows]
    conn.close()
    return jsonify({"tables": tables, "count": len(tables)})

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
    if table is None:
        conn.close()
        return jsonify({"error": "Table not found"}), 404

    cursor.execute("UPDATE tables SET status = ? WHERE id = ?", (new_status, table_id))
    conn.commit()
    cursor.execute("SELECT t.*, s.name as station_name FROM tables t JOIN stations s ON t.station_id = s.id WHERE t.id = ?", (table_id,))
    updated_table = dict(cursor.fetchone())
    conn.close()
    return jsonify({"message": "Status updated", "table": updated_table})

@app.route("/api/stations", methods=["GET"])
def get_stations():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM stations ORDER BY name")
    rows = cursor.fetchall()
    stations = [dict(row) for row in rows]
    conn.close()
    return jsonify({"stations": stations})

if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
