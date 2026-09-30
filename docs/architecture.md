# Decision Memory AI & Dark Factory Architecture

## 1. System Components

The project is structured into clean, decoupled tiers:

```
[ Developer UI (React SPA + Tailwind CSS + Lucide) ]
                       |
                       v
[ Express Server (server.ts) / Vite Dev Middleware ]
   ├── /api/health                    (Liveness & Offline Check)
   ├── /api/decisions                 (Deterministic Decision Memory Retrieval)
   └── /api/factory/agent-reasoning   (Optional Gemini Agent Hook with Offline Fallback)
                       |
                       v
[ Factory Orchestrator (src/services/factoryOrchestrator.ts) ]
   ├── Agent State Machine (PLANNING -> ARCHITECTING -> BUILDING -> TESTING -> REPAIRING -> ACCEPTED)
   ├── Evidence Ledger Store (Cryptographic SHA-256 Proof Seals)
   └── Live Activity Logger
                       |
        +--------------+--------------+
        |                             |
        v                             v
[ Wallet Engine ]            [ Decision Memory Corpus ]
(src/services/walletEngine.ts) (src/services/decisionMemory.ts)
- Integer Paise Math         - 5 Historical Architectural Records
- Serializable Mutex Lock    - Commits, PRs, Issue Citations
- Two-Phase Rollback         - Rejected Alternatives Rationale
- Idempotency Cache          - Zero-Network Local Ingress
```

---

## 2. The 5 Core Financial Invariants

All transactions processed by the factory and documented in Decision Memory adhere to 5 strict mathematical theorems:

1. **Conservation of Total Money Invariant**:
   $$\sum_{u} \text{Balance}_u(t) = \sum_{u} \text{Balance}_u(0) = \text{Constant (₹18,500.00)}$$
   Money is never created out of nothing, nor destroyed by network aborts.

2. **Non-Negative Balance Invariant**:
   $$\forall u \in \text{Users},\ \text{Balance}_u(t) \ge 0$$
   Parallel overdraft attacks and double-spend race conditions are strictly prevented.

3. **Integer Minor-Unit Standard**:
   $$\text{Amount} \in \mathbb{Z}^+ \quad (\text{Paise}, 1\text{ INR} = 100\text{ paise})$$
   Zero IEEE-754 floating-point epsilon leakage during circular multi-hop routing.

4. **Strict Idempotency Monotonicity**:
   $$\text{Apply}(\text{Request}_k, N) \equiv \text{Apply}(\text{Request}_k, 1)$$
   Network timeout storms and duplicate client retries return cached receipts without balance mutation.

5. **Atomic Two-Phase Rollback**:
   $$\text{Debit}(\text{Sender}) + \text{Credit}(\text{Recipient}) = 0$$
   If faults occur between debit and credit, the snapshot is restored immediately.

---

## 3. Decision Memory Retrieval Architecture

The Decision Memory service indexes architectural decisions by:
- **Decision ID** (`DEC-001` through `DEC-005`)
- **Query Overlap & Semantic Keywords**
- **Protected Invariants**
- **Structured Citations**: Commits, PR numbers, test vector IDs (`TEST-DS-01`, `TEST-DR-01`, `TEST-TX-01`).

Because the corpus is embedded locally and exposed through deterministic endpoints, the service functions with **100% offline capability**, making it fully container-testable without outbound internet access.
