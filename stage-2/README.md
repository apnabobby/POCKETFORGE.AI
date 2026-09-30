# Stage 2: Transfer Engine UI Dashboard & Live Audit Ledger

## Stage Title and Goal
**Stage 2: Real-Time Wallet Balance Dashboard, Transfer Form & Idempotency Cycling**
The goal of Stage 2 is to deliver a visual financial operations dashboard for the *Pocketful* track. It provides real-time wallet balance cards, an instant transfer form with client-side idempotency key generation, and a live double-entry audit ledger.

## Contributors
- **BAND Seat 1 (Planner / Architect)**
- **BAND Seat 2 (Implementer / Self-Healing)**
- **BAND Seat 3 (Adversarial Reviewer / Validator)**

---

## Checklist of Completed Items
- [x] Built responsive Jinja2 template (`templates/index.html`) featuring wallet balance cards and audit ledger.
- [x] Integrated Tailwind CSS with dark theme styling (`static/css/style.css`).
- [x] Added client-side asynchronous transfer dispatch with automatic UUID idempotency key cycling (`static/js/app.js`).
- [x] Added automated UI route and template rendering test suite (`test_ui.py`).

---

## Files Created in Stage 2
- `stage-2/app.py`: Flask application serving UI and REST endpoints.
- `stage-2/templates/index.html`: Responsive wallet dashboard template.
- `stage-2/static/css/style.css`: Financial dashboard styles.
- `stage-2/static/js/app.js`: Transfer dispatch and idempotency script.
- `stage-2/test_ui.py`: Automated integration test for dashboard HTML.
- `stage-2/requirements.txt`: Python package requirements.

---

## How to Run and Test This Stage
```bash
cd stage-2
pip install -r requirements.txt
python test_ui.py
python app.py
```
