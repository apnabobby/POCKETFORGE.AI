# Stage 3: Concurrency Locking, Retry Idempotency & Integer Math

## Stage Title and Goal
**Stage 3: Serializable Concurrency Control, Monotonic Idempotency & CWE-362 Race Condition Defenses**
The goal of Stage 3 is to fortify the wallet state machine against race conditions and concurrent double-spends. It introduces thread-safe serializable locking (`TRANSFER_LOCK`), strict positive integer minor-unit validation, monotonic idempotency caching, and an automated concurrency test suite.

## Contributors
- **BAND Seat 1 (Planner / Architect)**
- **BAND Seat 2 (Implementer / Self-Healing)**
- **BAND Seat 3 (Adversarial Reviewer / Validator)**

---

## Checklist of Completed Items
- [x] Introduced serializable mutex lock (`TRANSFER_LOCK`) around balance read-mutation pipelines.
- [x] Enforced strict positive integer minor-unit constraint (paise) with zero IEEE-754 decimal drift.
- [x] Implemented monotonic idempotency cache returning duplicate receipts without mutating state.
- [x] Added automated multi-threaded concurrency test suite `test_wallet.py` (firing 10 parallel threads to verify race condition defense).

---

## Files Created in Stage 3
- `stage-3/app.py`: Hardened Flask application with concurrency locking and atomic transactions.
- `stage-3/test_wallet.py`: Automated multi-threaded unit test verifying race condition rejection.
- `stage-3/requirements.txt`: Python package requirements.

---

## How to Run and Test This Stage
```bash
cd stage-3
pip install -r requirements.txt
python test_wallet.py
python app.py
```
