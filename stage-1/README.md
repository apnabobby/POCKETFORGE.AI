# Stage 1: Pocketful Autonomous Wallet & Ledger REST API

## Stage Title and Goal
**Stage 1: Core Double-Entry Ledger, Integer Minor-Unit Engine & Wallet REST API**
The goal of Stage 1 is to establish the backend database schema and atomic REST endpoints for the *Pocketful* autonomous wallet ledger. It implements positive integer minor-unit balance tracking (paise/cents), balance lookups, and double-entry transaction posting with idempotency verification.

## Contributors
- **BAND Seat 1 (Planner / Architect)**
- **BAND Seat 2 (Implementer / Self-Healing)**
- **BAND Seat 3 (Adversarial Reviewer / Validator)**

---

## Checklist of Completed Items
- [x] Initialized Flask server with SQLite relational schema (`wallets`, `ledger_transactions`).
- [x] Implemented core REST API endpoints:
  - `GET /api/health`: Health status & hackathon track verification.
  - `GET /api/wallets`: List all wallets and calculate total system money supply.
  - `GET /api/wallets/<id>`: Retrieve single wallet balance.
  - `POST /api/transfers`: Atomically transfer funds between wallets with idempotency checks.
  - `GET /api/transfers`: Retrieve full double-entry audit ledger.
- [x] Implemented positive integer minor-unit constraint (paise) to prevent IEEE-754 decimal drift.
- [x] Created automated test suite `test_api.py` validating transfers, duplicate retries, and overdraft protections.

---

## Files Created in Stage 1
- `stage-1/app.py`: Flask application with SQLite database engine and transfer APIs.
- `stage-1/test_api.py`: Automated unit tests verifying balance mutations, idempotency, and overdraft prevention.
- `stage-1/requirements.txt`: Python package requirements (Flask, pytest).

---

## How to Run and Test This Stage
```bash
cd stage-1
pip install -r requirements.txt
python test_api.py
python app.py
```
