# Stage 4: Autonomous Dark Factory Stress Harness & Vercel Deployment

## Stage Title and Goal
**Stage 4: Autonomous 50-Vector Adversarial Matrix, Dark Factory Harness & Vercel Serverless Integration**
The goal of Stage 4 is to produce the final, certified release of the *Pocketful* autonomous ledger. It incorporates `dark_factory.py`, an autonomous red-team testing suite that executes 50 distinct adversarial attack vectors (concurrent double-spends, atomicity crash rollbacks, circular money conservation, replay storms, and precision boundary fuzzing), along with Vercel serverless integration (`index.py`, `vercel.json`).

## Contributors
- **BAND Seat 1 (Planner / Architect)**
- **BAND Seat 2 (Implementer / Self-Healing)**
- **BAND Seat 3 (Adversarial Reviewer / Validator)**

---

## Checklist of Completed Items
- [x] Implemented `dark_factory.py` executing 50 automated adversarial vectors.
- [x] Verified 100.0% mathematical money conservation ($\sum \text{Balances} = \text{Constant}$) across all attack cycles.
- [x] Configured Vercel serverless WSGI entrypoint `index.py` and route rules `vercel.json`.
- [x] Bound `/api/dark-factory/run` telemetry endpoint for on-demand stress verification.

---

## Files Created in Stage 4
- `stage-4/app.py`: Hardened production Flask server with Dark Factory trigger.
- `stage-4/dark_factory.py`: Autonomous 50-vector stress test runner.
- `stage-4/index.py`: Serverless WSGI entrypoint for Vercel.
- `stage-4/vercel.json`: Zero-config serverless deployment config.
- `stage-4/templates/index.html`: Production dashboard template.
- `stage-4/static/`: Static stylesheet and client script.
- `stage-4/requirements.txt`: Python package requirements.

---

## How to Run and Test This Stage
```bash
cd stage-4
pip install -r requirements.txt
python dark_factory.py
python app.py
```
