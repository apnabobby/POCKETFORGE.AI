# Stage 2 - Flask server serving Wallet Dashboard UI & REST APIs
# Contributors: BAND Agents (Seat 1: Planner/Architect, Seat 2: Implementer, Seat 3: Reviewer/Validator)

import os
import sqlite3
from flask import Flask, jsonify, request, render_template

app = Flask(__name__, template_folder="templates", static_folder="static")
DB_PATH = os.environ.get("DATABASE_PATH", "wallet_stage2.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS wallets (
            id TEXT PRIMARY KEY,
            owner_name TEXT NOT NULL,
            balance_paise INTEGER NOT NULL,
            currency TEXT NOT NULL DEFAULT 'INR',
            version INTEGER NOT NULL DEFAULT 1
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ledger_transactions (
            id TEXT PRIMARY KEY,
            idempotency_key TEXT UNIQUE NOT NULL,
            sender_id TEXT NOT NULL,
            recipient_id TEXT NOT NULL,
            amount_paise INTEGER NOT NULL,
            status TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            audit_checksum TEXT NOT NULL,
            FOREIGN KEY (sender_id) REFERENCES wallets (id),
            FOREIGN KEY (recipient_id) REFERENCES wallets (id)
        )
    """)
    cursor.execute("SELECT COUNT(*) FROM wallets")
    if cursor.fetchone()[0] == 0:
        cursor.executemany("""
            INSERT INTO wallets (id, owner_name, balance_paise, currency, version)
            VALUES (?, ?, ?, ?, ?)
        """, [
            ("W-ALICE", "Alice Sharma", 500000, "INR", 1),       # ₹5,000.00
            ("W-BOB", "Bob Verma", 350000, "INR", 1),           # ₹3,500.00
            ("W-CHARLIE", "Charlie Patel", 1000000, "INR", 1),   # ₹10,000.00
        ])
    conn.commit()
    conn.close()

@app.route("/", methods=["GET"])
def index():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM wallets ORDER BY id")
    wallets = [dict(r) for r in cursor.fetchall()]
    total_supply = sum(w["balance_paise"] for w in wallets)
    cursor.execute("SELECT * FROM ledger_transactions ORDER BY timestamp DESC LIMIT 20")
    transactions = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return render_template(
        "index.html",
        wallets=wallets,
        transactions=transactions,
        total_supply_paise=total_supply,
        total_supply_inr=f"₹{total_supply / 100:,.2f}"
    )

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "PocketForge AI - Autonomous Wallet Ledger",
        "track": "Pocketful",
        "stage": "stage-2",
        "contributors": ["BAND Seat 1 (Planner)", "BAND Seat 2 (Implementer)", "BAND Seat 3 (Reviewer)"]
    })

@app.route("/api/wallets", methods=["GET"])
def get_wallets():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM wallets ORDER BY id")
    wallets = [dict(r) for r in cursor.fetchall()]
    total_supply = sum(w["balance_paise"] for w in wallets)
    conn.close()
    return jsonify({"wallets": wallets, "count": len(wallets), "total_supply_paise": total_supply})

@app.route("/api/transfers", methods=["POST"])
def execute_transfer():
    data = request.get_json() or {}
    sender_id = data.get("sender_id")
    recipient_id = data.get("recipient_id")
    amount_paise = data.get("amount_paise")
    idempotency_key = data.get("idempotency_key")

    if not all([sender_id, recipient_id, amount_paise, idempotency_key]):
        return jsonify({"error": "Missing required fields"}), 400

    if not isinstance(amount_paise, int) or amount_paise <= 0:
        return jsonify({"error": "amount_paise must be positive integer"}), 400

    if sender_id == recipient_id:
        return jsonify({"error": "Self-transfers prohibited"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM ledger_transactions WHERE idempotency_key = ?", (idempotency_key,))
    existing = cursor.fetchone()
    if existing:
        conn.close()
        rec = dict(existing)
        rec["is_duplicate"] = True
        return jsonify({"message": "Duplicate acknowledged", "transaction": rec}), 200

    cursor.execute("SELECT * FROM wallets WHERE id = ?", (sender_id,))
    sender = cursor.fetchone()
    cursor.execute("SELECT * FROM wallets WHERE id = ?", (recipient_id,))
    recipient = cursor.fetchone()

    if not sender or not recipient:
        conn.close()
        return jsonify({"error": "Wallet not found"}), 404

    if sender["balance_paise"] < amount_paise:
        conn.close()
        return jsonify({"error": f"Insufficient funds: available {sender['balance_paise']}p"}), 400

    tx_id = f"TX-{os.urandom(4).hex().upper()}"
    checksum = f"SHA256:{sender_id}->{recipient_id}:{amount_paise}"

    cursor.execute("UPDATE wallets SET balance_paise = balance_paise - ?, version = version + 1 WHERE id = ?", (amount_paise, sender_id))
    cursor.execute("UPDATE wallets SET balance_paise = balance_paise + ?, version = version + 1 WHERE id = ?", (amount_paise, recipient_id))
    cursor.execute("""
        INSERT INTO ledger_transactions (id, idempotency_key, sender_id, recipient_id, amount_paise, status, audit_checksum)
        VALUES (?, ?, ?, ?, ?, 'COMMITTED', ?)
    """, (tx_id, idempotency_key, sender_id, recipient_id, amount_paise, checksum))
    conn.commit()

    cursor.execute("SELECT * FROM ledger_transactions WHERE id = ?", (tx_id,))
    committed_tx = dict(cursor.fetchone())
    conn.close()
    return jsonify({"message": "Transfer successful", "transaction": committed_tx}), 201

@app.route("/api/transfers", methods=["GET"])
def list_transfers():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM ledger_transactions ORDER BY timestamp DESC")
    rows = cursor.fetchall()
    transfers = [dict(r) for r in rows]
    conn.close()
    return jsonify({"transfers": transfers, "count": len(transfers)})

if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
