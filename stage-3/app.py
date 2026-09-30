# Stage 3 - Concurrency Locking, Retry Idempotency & Integer Minor Units
# Contributors: BAND Agents (Seat 1: Planner, Seat 2: Implementer, Seat 3: Reviewer)

import os
import re
import sqlite3
import threading
from flask import Flask, jsonify, request, render_template

app = Flask(__name__, template_folder="templates", static_folder="static")
DB_PATH = os.environ.get("DATABASE_PATH", "wallet_stage3.db")

# Global mutex lock to enforce serializable transfers across concurrent threads
TRANSFER_LOCK = threading.Lock()

def get_db_connection():
    conn = sqlite3.connect(DB_PATH, timeout=20.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn

def sanitize_id(identifier: str) -> str:
    """Sanitize wallet IDs to alphanumeric and hyphens only."""
    if not identifier:
        return ""
    return re.sub(r"[^A-Za-z0-9_-]", "", identifier.strip().upper())

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
    cursor.execute("SELECT * FROM ledger_transactions ORDER BY timestamp DESC LIMIT 30")
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
        "stage": "stage-3",
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

@app.route("/api/wallets/<string:wallet_id>", methods=["GET"])
def get_wallet(wallet_id):
    clean_id = sanitize_id(wallet_id)
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM wallets WHERE id = ?", (clean_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return jsonify({"error": "Wallet not found"}), 404
    w = dict(row)
    w["balance_inr"] = f"₹{w['balance_paise'] / 100:.2f}"
    return jsonify(w)

@app.route("/api/transfers", methods=["POST"])
def execute_transfer():
    data = request.get_json() or {}
    raw_sender = data.get("sender_id", "")
    raw_recipient = data.get("recipient_id", "")
    amount_paise = data.get("amount_paise")
    idempotency_key = str(data.get("idempotency_key", "")).strip()

    sender_id = sanitize_id(raw_sender)
    recipient_id = sanitize_id(raw_recipient)

    if not all([sender_id, recipient_id, amount_paise, idempotency_key]):
        return jsonify({"error": "Missing required fields (sender_id, recipient_id, amount_paise, idempotency_key)"}), 400

    # Invariant 3: Positive integer minor units only
    if not isinstance(amount_paise, int) or amount_paise <= 0:
        return jsonify({"error": "INVALID_AMOUNT: amount_paise must be a strictly positive integer"}), 400

    if sender_id == recipient_id:
        return jsonify({"error": "SELF_TRANSFER_PROHIBITED: Sender and recipient must be distinct wallets"}), 400

    # Acquire serializable concurrency lock to eliminate race conditions (CWE-362)
    with TRANSFER_LOCK:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Invariant 4: Monotonic Idempotency check
        cursor.execute("SELECT * FROM ledger_transactions WHERE idempotency_key = ?", (idempotency_key,))
        existing = cursor.fetchone()
        if existing:
            conn.close()
            rec = dict(existing)
            rec["is_duplicate"] = True
            return jsonify({"message": "Duplicate request acknowledged", "transaction": rec}), 200

        try:
            cursor.execute("BEGIN IMMEDIATE")

            cursor.execute("SELECT * FROM wallets WHERE id = ?", (sender_id,))
            sender = cursor.fetchone()
            cursor.execute("SELECT * FROM wallets WHERE id = ?", (recipient_id,))
            recipient = cursor.fetchone()

            if not sender or not recipient:
                conn.rollback()
                conn.close()
                return jsonify({"error": "Sender or recipient wallet not found"}), 404

            # Invariant 2: Non-negative balance constraint
            if sender["balance_paise"] < amount_paise:
                conn.rollback()
                conn.close()
                return jsonify({
                    "error": f"INSUFFICIENT_FUNDS: Available {sender['balance_paise']}p, requested {amount_paise}p"
                }), 400

            # Atomic balance mutation
            tx_id = f"TX-{os.urandom(4).hex().upper()}"
            checksum = f"SHA256:{sender_id}->{recipient_id}:{amount_paise}:{sender['version']+1}"

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
        except Exception as e:
            conn.rollback()
            conn.close()
            return jsonify({"error": f"Transaction failed: {str(e)}"}), 500

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
