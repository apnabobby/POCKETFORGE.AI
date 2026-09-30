# Stage 1 - Flask application, SQLite schema & Table REST API
# Contributors: Google AI Studio, BAND

import os
import sqlite3
from flask import Flask, jsonify, request

app = Flask(__name__)
DB_PATH = os.environ.get("DATABASE_PATH", "tablekeeper_stage1.db")
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
    # Seed default stations if empty
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

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "L'Étoile Noire Tablekeeper",
        "stage": "stage-1",
        "contributors": ["Google AI Studio", "BAND"]
    })

@app.route("/api/tables", methods=["GET"])
def get_tables():
    conn = get_db_connection()
    cursor = conn.cursor()
    station_filter = request.args.get("station")
    if station_filter:
        cursor.execute("SELECT * FROM tables WHERE station_id = ? ORDER BY table_number", (station_filter,))
    else:
        cursor.execute("SELECT * FROM tables ORDER BY table_number")
    rows = cursor.fetchall()
    tables = [dict(row) for row in rows]
    conn.close()
    return jsonify({"tables": tables, "count": len(tables)})

@app.route("/api/tables/<int:table_id>", methods=["GET"])
def get_table(table_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tables WHERE id = ?", (table_id,))
    row = cursor.fetchone()
    conn.close()
    if row is None:
        return jsonify({"error": "Table not found"}), 404
    return jsonify(dict(row))

@app.route("/api/tables/<int:table_id>/status", methods=["POST"])
def update_table_status(table_id):
    data = request.get_json() or {}
    new_status = data.get("status", "").upper()
    if new_status not in VALID_STATUSES:
        return jsonify({
            "error": f"Invalid status '{new_status}'. Allowed: {list(VALID_STATUSES)}"
        }), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tables WHERE id = ?", (table_id,))
    table = cursor.fetchone()
    if table is None:
        conn.close()
        return jsonify({"error": "Table not found"}), 404

    cursor.execute("UPDATE tables SET status = ? WHERE id = ?", (new_status, table_id))
    conn.commit()
    cursor.execute("SELECT * FROM tables WHERE id = ?", (table_id,))
    updated_table = dict(cursor.fetchone())
    conn.close()
    return jsonify({
        "message": f"Table {updated_table['table_number']} status changed to {new_status}",
        "table": updated_table
    })

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
