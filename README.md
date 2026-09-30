# PocketForge AI — Autonomous Wallet & Double-Entry Ledger Dark Factory
> **WeAreDevelopers x BAND Hackathon Entry**
> **Track: Pocketful (Autonomous Wallet & Transfer Ledger)**
>
> **Project Contributors:**
> - **BAND Agents** (Seat 1: Planner/Architect, Seat 2: Implementer, Seat 3: Reviewer/Validator)

---

## 1. System Overview & Pocketful Track Alignment

**PocketForge AI** is an autonomous software engineering dark factory engineered exclusively for the **Pocketful** hackathon track. It solves the critical vulnerabilities inherent in distributed payment rails:
1. **Zero Double-Spending (CWE-362)**: Per-wallet serializable mutex locks and atomic isolation.
2. **Zero Currency Drift (CWE-1335)**: Pure integer minor-unit balance engine (paise/cents) eliminating IEEE-754 floating-point inaccuracies.
3. **Conservation of Total Money (CWE-682)**: Mathematically enforces $\sum \text{Balances} = \text{Constant}$ across all closed-loop transfers.
4. **Strict Idempotency Monotonicity (CWE-294 / CWE-400)**: Dropped-ACK retries and parallel bursts return cached receipts without balance mutation.
5. **Atomic Two-Phase Rollback (CWE-284)**: Mid-transaction crashes and network failures roll back cleanly.

---

## 2. BAND Evidence & Artifacts

In strict compliance with **Hackathon Rule #4 (Generic Seat Mandates)** and **Rule #5 (BAND Desktop Room Export)**:

- **BAND Desktop Room Session Export**:
  - Direct JSON Session State: [`/band-export/pocketforge_room_session.json`](band-export/pocketforge_room_session.json)
  - Detailed Execution History & Agent Logs: [`/band-export/EXPORT_LOG.md`](band-export/EXPORT_LOG.md)
- **Generic Standing Agent Mandates**:
  - Seat 1 (Planner / Architect): [`/mandates/seat_1_planner_architect.md`](mandates/seat_1_planner_architect.md)
  - Seat 2 (Implementer / Self-Healing): [`/mandates/seat_2_implementer_repair.md`](mandates/seat_2_implementer_repair.md)
  - Seat 3 (Adversarial Reviewer / Validator): [`/mandates/seat_3_adversarial_verifier.md`](mandates/seat_3_adversarial_verifier.md)

*Notice: In compliance with hackathon rules, all standing mandates in `/mandates/` are 100% generic, containing zero track-specific jargon, tables, or route paths.*

---

## 3. Stage-Wise Progression Summary (Stages 1 to 4)

| Stage | Focus Area | Key Architectural Deliverables | Verification Suite |
| :--- | :--- | :--- | :--- |
| **Stage 1** | **Core Ledger & REST API** | Relational SQLite double-entry tables (`wallets`, `ledger_transactions`), balance lookup, positive integer validation. | `stage-1/test_api.py` unit tests pass. |
| **Stage 2** | **Visual Transfer Dashboard** | Jinja2 dashboard UI, conserved money metric card, prefillable wallet selection, live audit stream. | `stage-2/test_ui.py` render tests pass. |
| **Stage 3** | **Concurrency & Idempotency** | Serializable mutex locking (`TRANSFER_LOCK`), idempotency cache, atomic `BEGIN IMMEDIATE` rollbacks. | `stage-3/test_wallet.py` (10 concurrent threads) passes. |
| **Stage 4** | **Autonomous Dark Factory & Deployment** | Autonomous Red-Team exploit suite (`dark_factory.py`) with 50 adversarial attack vectors, Vercel serverless integration (`index.py`, `vercel.json`). | `python dark_factory.py` (50/50 vectors PASS). |

---

## 4. Repository Structure

```text
.
├── band-export/
│   ├── pocketforge_room_session.json # Full BAND Desktop room session export
│   └── EXPORT_LOG.md                 # Detailed chronological agent logs
├── mandates/
│   ├── seat_1_planner_architect.md   # Generic Seat 1 mandate
│   ├── seat_2_implementer_repair.md  # Generic Seat 2 mandate
│   └── seat_3_adversarial_verifier.md# Generic Seat 3 mandate
├── stage-1/                          # Stage 1: Core Double-Entry Ledger REST API
│   ├── README.md
│   ├── app.py
│   ├── test_api.py
│   └── requirements.txt
├── stage-2/                          # Stage 2: Transfer Dashboard UI
│   ├── README.md
│   ├── app.py
│   ├── templates/index.html
│   ├── static/css/style.css
│   ├── static/js/app.js
│   ├── test_ui.py
│   └── requirements.txt
├── stage-3/                          # Stage 3: Concurrency Locking & Race Defense
│   ├── README.md
│   ├── app.py
│   ├── test_wallet.py
│   └── requirements.txt
├── stage-4/                          # Stage 4: Dark Factory Stress Runner & Serverless
│   ├── README.md
│   ├── app.py
│   ├── dark_factory.py
│   ├── index.py
│   ├── vercel.json
│   ├── templates/index.html
│   ├── static/
│   └── requirements.txt
├── src/                              # Full React SPA Application (Decision Memory AI)
├── server.ts                         # Express + Vite server (Port 3000)
├── package.json
└── README.md                         # Main documentation
```

---

## 5. Quick Start & Execution

### A. Run Autonomous Dark Factory Stress Runner (50 Vectors)
```bash
# Run the 50-vector adversarial red-team battery in Stage 4
cd stage-4
python3 dark_factory.py
```
**Expected Output:**
```text
===========================================================================
🏭 POCKETFORGE AI — AUTONOMOUS DARK FACTORY STRESS RUNNER
   Track: Pocketful | Invariants: 5 Core Theorems | Vectors: 50
   Contributors: BAND Agents (Seat 1, Seat 2, Seat 3)
===========================================================================
[✅ PASS] [CWE-362] RACE_DOUBLE_SPEND_BURST_1: Exactly 1 succeeded, 4 rejected cleanly
...
---------------------------------------------------------------------------
📊 STRESS SUMMARY: 50/50 VECTORS PASSED (0 FAILS)
   Total Money Conservation: 100.0% Verified
===========================================================================
```

### B. Run Full Application (Decision Memory AI & Dark Factory Dashboard)
```bash
npm run dev
```
Navigate to the running app to view the live dashboard on Port 3000.

---

## 6. Contributors
- **BAND Agents** (Seat 1: Planner/Architect, Seat 2: Implementer, Seat 3: Reviewer/Validator)
