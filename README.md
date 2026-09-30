# Decision Memory AI & Dark Factory
> **Autonomous Software Engineering Dark Factory with Explainable Decision Memory, Red-Team Adversarial Matrix, and Cryptographic Evidence Seals.**
>
> **Project Contributors:**
> - **BAND** (Seat 1: Planner/Architect, Seat 2: Implementer, Seat 3: Reviewer/Validator)

---

## 1. System Overview
**Decision Memory AI / PocketForge Dark Factory** is an autonomous software engineering system that receives engineering tasks, decomposes architecture, synthesizes code, subjects it to adversarial attack batteries, performs self-repair, audits state invariants, and produces cryptographic proof seals.

In addition to code generation, it provides **Decision Memory**: an architectural search engine answering *what* was built, *why* it was chosen, *which alternatives were rejected*, and *which empirical commits/PRs validate the decision*.

---

## 2. Key Architecture & Features

1. **Autonomous Multi-Agent Pipeline**:
   - `Planner / Architect (Seat 1)`: Invariant modeling and task decomposition.
   - `Implementer (Seat 2)`: Code synthesis, mutex locking, and integer math primitives.
   - `Reviewer / Validator (Seat 3)`: Adversarial testing and invariant proofs.
   - `Self-Repair Agent`: Autonomous patch synthesis and re-verification.

2. **Integer Paise Wallet Engine & 5 Core Invariants**:
   - **Conservation of Total Money**: $\sum \text{Balances} = \text{Constant (₹18,500.00)}$.
   - **Non-Negative Balances**: $\text{Balance} \ge 0$.
   - **Integer Minor Units**: Zero IEEE-754 floating-point drift.
   - **Strict Idempotency Monotonicity**: Duplicate retries return cached receipts without balance mutation.
   - **Atomic Two-Phase Rollback**: Debits and credits are executed as a single indivisible unit.

3. **Threat Intelligence Heatmap**:
   - 50-attack vector matrix mapped against Common Weakness Enumerations (**CWE-362**, **CWE-284**, **CWE-682**, etc.) with real-time pass/fail topology.

4. **Cryptographic Evidence Ledger**:
   - SHA-256 state seal for every invariant proof and test suite run.

5. **100% Offline Compatible**:
   - Deterministic local decision memory corpus requiring zero outbound network access.

---

## 3. Repository Structure

```text
.
├── src/                           # React UI, Components, and Core Services
│   ├── components/                # Threat Heatmap, Agent Pipeline, Decision Memory UI
│   ├── services/                  # Wallet Engine, Adversarial Runner, Decision Memory
│   └── types/                     # TypeScript Interfaces
├── stage-1/                       # Self-contained buildable Stage 1 service
├── docs/                          # BAND Compliance, Mandates, Architecture & Video Checklists
│   ├── band-agent-mandates.md     # 3 Generic coding-agent standing mandates
│   ├── band-factory-description.md# Dark Factory system architecture
│   ├── architecture.md            # Financial invariants & multi-tier design
│   ├── offline-build.md           # Zero-network container build recipe
│   ├── submission-checklist.md    # Compliance checklist & disqualification safety
│   └── video-checklist.md         # BAND Desktop video recording checklist
├── server.ts                      # Express API backend + Vite development middleware
├── package.json                   # Dependencies & build scripts
├── Dockerfile                     # Offline-capable container specification
└── README.md                      # Main project documentation
```

---

## 4. Quick Start & Execution

### Local Development
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Clean Offline Docker Container
```bash
# Build Docker image
docker build -t decision-memory-ai:latest .

# Run in an isolated container without network access
docker run --rm -p 3000:3000 --network none decision-memory-ai:latest
```

### Health Check Endpoint
```bash
curl http://localhost:3000/api/health
```

---

## 5. Contributors
- **BAND** (Seat 1: Planner/Architect, Seat 2: Implementer, Seat 3: Reviewer/Validator)
