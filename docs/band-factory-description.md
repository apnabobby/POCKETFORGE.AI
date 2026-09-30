# BAND Software Dark Factory Architecture

## 1. Overview & Vision
The **Decision Memory AI / PocketForge Dark Factory** is an autonomous software engineering system capable of receiving technical requirements, planning architecture, implementing code, executing adversarial attack suites, detecting vulnerabilities, autonomously repairing defects, independently auditing results, and generating cryptographic evidence.

In addition to autonomous code synthesis, the system provides **Decision Memory**: a structured engine that explains not only *what* code was built, but *why* specific architectural decisions were chosen, which alternatives were considered and rejected, and which empirical git/issue evidence validates the decision.

---

## 2. Reusable Factory Architecture

The factory operates through a decoupled multi-agent state machine. Crucially, agent seats maintain **generic standing roles** (defined in `docs/band-agent-mandates.md`), while project-specific requirements are provided dynamically as tasks.

```
                  +--------------------------------+
                  |       TASK INGRESS (User)      |
                  +--------------------------------+
                                  |
                                  v
                  +--------------------------------+
                  |  SEAT 1: PLANNER / ARCHITECT   |
                  |  - Requirement Decomposition   |
                  |  - Invariant Modeling          |
                  |  - Interface Contracts         |
                  +--------------------------------+
                                  |
                                  v
                  +--------------------------------+
                  |       SEAT 2: IMPLEMENTER      |
                  |  - Code Synthesis & Handlers   |
                  |  - State Mutation Primitives   |
                  +--------------------------------+
                                  |
                                  v
                  +--------------------------------+
                  |  SEAT 3: REVIEWER / VALIDATOR  |
                  |  - Adversarial Testing Battery |
                  |  - Invariant Proof & Telemetry |
                  +--------------------------------+
                             /          \
                (Vulnerability Found)   (All Invariants Passed)
                           /              \
                          v                v
               +--------------------+   +-----------------------+
               |  REPAIR ITERATION  |   |    FINAL SIGN-OFF     |
               |  - Root-Cause Fix  |   |  - Cryptographic Hash |
               |  - Return to S2    |   |  - FACTORY ACCEPTED   |
               +--------------------+   +-----------------------+
```

---

## 3. Dynamic Task Protocol vs. Generic Mandates

To ensure strict compliance with BAND Desktop evaluation criteria:
- **Standing Mandates**: Contain zero track-specific implementation logic, endpoints, or error codes.
- **Task Payload**: Encapsulates the specific software goal (e.g., *“Implement a double-entry integer paise transfer engine with serializable mutex isolation and queryable decision memory”*).
- **Evidence Artifact**: Every action produces an immutable audit record containing:
  - Agent Seat ID
  - Invariant Tested
  - Verification Hash (SHA-256)
  - Result (`PASS` / `FAIL` / `NEEDS_REPAIR`)
  - Rationale & Citations

---

## 4. Decision Memory Integration

Decision Memory operates as a persistent knowledge substrate:
1. **Developer Ingress**: A developer enters a technical question regarding an architectural pattern.
2. **Deterministic Retrieval**: The system queries local decision records without external internet dependencies.
3. **Structured Explanation**:
   - **What Decision Was Made**: The precise architectural rule enforced.
   - **Why It Was Made**: The failure mode or invariant that mandated it.
   - **Alternatives Rejected**: Concrete counter-proposals (e.g. IEEE-754 floats, optimistic locking) and why they failed under adversarial stress.
   - **Evidence Citations**: Commit hashes, PR diffs, and test incident logs validating the decision.
