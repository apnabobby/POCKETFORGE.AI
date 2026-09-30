# Decision Memory AI

> **"Understand not only WHAT the code does, but WHY a technical decision was made."**
> A developer-oriented intelligence system that organizes project evidence (commits, pull requests, issues, and discussions) into structured architectural explanations, backed by an autonomous AI Dark Factory.

---

## 1. Project Overview & Problem Statement

### The Problem
When developers inherit or work on complex software systems, code comments and PR summaries often explain *what* a line of code does, but obscure *why* a particular architecture or constraint was chosen. When engineers lack this context:
- They inadvertently re-introduce rejected approaches (e.g. switching from integer minor units to floats).
- They break critical safety invariants (e.g. bypassing mutex locks during refactoring).
- Onboarding takes weeks of digging through fragmented Slack threads, commit messages, and closed GitHub issues.

### The Solution: Decision Memory AI
**Decision Memory AI** captures, structures, and serves architectural decisions with empirical evidence. When a developer asks a question:
1. **Identifies relevant project evidence**: Maps the inquiry to local commits, issues, pull requests, and architectural incident reports.
2. **Organizes findings into a 4-part architectural explanation**:
   - **What Decision Was Made**: Clear specification of the implemented rule.
   - **Why It Was Made**: The failure mode, risk, or invariant that required it.
   - **Alternatives Considered & Why Rejected**: Concrete counter-proposals that were tested and discarded.
   - **Supporting Citations & Evidence**: Exact commit hashes, issue numbers, and test vector references.
3. **Backed by an Autonomous AI Dark Factory**: Simulates a full software production loop (Plan $\to$ Architect $\to$ Implement $\to$ Adversarial Attack $\to$ Independent Verification $\to$ Autonomous Self-Repair).

---

## 2. Key Features

- **Architectural Decision Search**: Searchable technical decision corpus with keyword matching and instant multi-dimensional reasoning.
- **Empirical Evidence Citations**: Direct references to commits, pull requests, and adversarial fault test incidents.
- **5 Core Financial Invariants**:
  1. *Conservation of Total Money* ($\sum \text{Balances} = \text{Constant}$)
  2. *Non-Negative Balances* ($\text{Balance} \ge 0$)
  3. *Integer Minor Units* (Paise arithmetic, zero IEEE-754 float drift)
  4. *Strict Idempotency Monotonicity* (Deduplicated retry storms)
  5. *Two-Phase Atomic Rollback* (Crash recovery without fund leakage)
- **Autonomous Dark Factory Pipeline**: 6 specialized agents with visible failure detection (double-spend exploit) and autonomous patch synthesis.
- **Interactive Simulated Wallet**: Safe testbed with user accounts (Alice, Bob, Charlie, David), live transfer execution, and attack console.
- **One-Click Audit Dossier Export**: Generate and download complete PDF executive reports and raw JSON evidence dossiers for evaluation.
- **Clean Offline Execution**: Zero outbound network requirement at runtime; reproducible clean container support.

---

## 3. Architecture & Technologies Used

```
[ Developer UI (React SPA + Tailwind CSS + Lucide Icons) ]
                         |
                         v
[ Express Server (server.ts) / Vite Dev Middleware ]
   ├── /api/health                    (Container Liveness Check)
   ├── /api/decisions                 (Deterministic Decision Memory Retrieval)
   └── /api/factory/agent-reasoning   (Optional Gemini Agent with Local Fallback)
                         |
                         v
[ Factory Orchestrator & State Machine ]
   ├── Planner Agent          (Requirements & Invariant Boundary)
   ├── Architect Agent        (Domain Models & Mutex Lock Strategy)
   ├── Builder Agent          (Implementation Code Synthesis)
   ├── Adversarial Tester     (50-Vector Attack Battery)
   ├── Independent Verifier   (Blue-Team Gatekeeper Sign-off)
   └── Repair Agent           (Root-Cause Diagnosis & Security Patching)
                         |
         +---------------+---------------+
         |                               |
         v                               v
 [ Wallet Engine ]             [ Decision Memory Corpus ]
 - Mutex Queues                - 5 Sealed Architectural Records
 - Two-Phase Rollback          - Commit/PR/Issue Citations
 - Integer Minor Units         - 100% Offline Deterministic
```

### Technologies:
- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Vite 8.
- **Backend / API**: Express 4, Node.js 22, tsx runtime.
- **Containerization**: Multi-stage Dockerfile (Node 22 Alpine).
- **AI / Simulation**: Deterministic offline simulation engine with optional Gemini 3.8 Flash server proxy.

---

## 4. How to Run Locally

### Prerequisites
- Node.js >= 20
- npm >= 9

### Installation & Run
```bash
# Install dependencies cleanly
npm install

# Run type check and lint
npm run lint

# Start full-stack local server (Dev mode)
npm run dev

# Or start production server
npm run build
npm run start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. How to Build the Clean Container (Offline Compatible)

The service is designed to build and execute cleanly with **no outbound network access** at runtime:

```bash
# 1. Build Docker image
docker build -t decision-memory-ai:latest .

# 2. Run container (standard host network)
docker run --rm -p 3000:3000 decision-memory-ai:latest

# 3. Or test in strict isolated offline mode
docker run --rm -p 3000:3000 --network none decision-memory-ai:latest
```

### Verify Container Health
```bash
curl http://localhost:3000/api/health
```
Response:
```json
{
  "status": "healthy",
  "app": "Decision Memory AI / PocketForge Dark Factory",
  "version": "1.0.0",
  "offlineModeSupported": true,
  "geminiAvailable": false,
  "timestamp": "..."
}
```

---

## 6. Stage Structure

The repository uses an isolated, verifiable stage layout:

```
/
├── stage-1/                 # Complete, self-contained, buildable Stage 1
│   ├── README.md            # Stage 1 documentation and test verification
│   ├── package.json         # Dependency manifest
│   ├── server.ts            # Server entrypoint
│   ├── vite.config.ts       # Vite configuration
│   ├── tsconfig.json        # TypeScript configuration
│   ├── index.html           # HTML template
│   └── src/                 # Stage 1 source code
├── docs/                    # BAND Desktop & hackathon compliance guides
│   ├── band-agent-mandates.md     # 3 Generic agent mandates (Seat 1, 2, 3)
│   ├── band-factory-description.md # Reusable dark factory architecture
│   ├── architecture.md            # System architecture & 5 financial invariants
│   ├── offline-build.md           # Clean build and no-network execution guide
│   ├── submission-checklist.md    # Automated vs. manual compliance audit
│   └── video-checklist.md         # Video recording compliance rules
├── Dockerfile               # Production multi-stage offline container build
├── .dockerignore            # Clean build ignore list
└── README.md                # Main documentation
```

*Note: In compliance with hackathon rules, only verified, buildable stages are included (Stage 1).*

---

## 7. BAND Desktop Integration & 3 Agent Seats

The project is designed to be operated inside **BAND Desktop** using three distinct coding-agent seats:

1. **Seat 1 — Planner / Architect**: Analyzes engineering assignments, defines acceptance criteria and invariant boundaries, and passes structured implementation plans.
2. **Seat 2 — Implementer**: Implements assigned tasks, writes clean code, and maintains unit invariants.
3. **Seat 3 — Reviewer / Validator**: Independently evaluates code, executes adversarial attacks, detects vulnerabilities, and provides formal verdicts.

> **CRITICAL COMPLIANCE NOTICE**:
> The standing mandates in `docs/band-agent-mandates.md` are strictly **generic**. They contain no track-specific endpoint paths, database field names, or challenge jargon. All specific goals are assigned via dynamic tasks.

---

## 8. Limitations & Prototype Boundaries

1. **Hackathon Prototype / Simulation**: This system is an architectural prototype and dark factory simulation for hackathon demonstration. It is not connected to real banking networks.
2. **Deterministic Fallback**: When external LLM API keys are not supplied, the factory and Decision Memory execute using the deterministic local corpus and rule engine.
3. **Manual BAND Desktop Steps**: Code alone cannot operate your local BAND Desktop app; you must configure the seats, run the workflow, export the room, and record your demonstration video manually.

---

## 9. Hackathon Submission & Disqualification Checklist

Before submitting, verify compliance against `docs/submission-checklist.md`:

### DO NOT:
- **DO NOT** put project-specific endpoints or field names in standing agent mandates.
- **DO NOT** create fake stage folders that do not compile.
- **DO NOT** submit a video without recording the BAND Desktop room (grounds for disqualification).
- **DO NOT** rely on external internet access in the clean container.
- **DO NOT** claim manual steps (seat creation, room export, video recording) were automated by code.

For complete verification steps, see:
- `docs/band-agent-mandates.md`
- `docs/submission-checklist.md`
- `docs/video-checklist.md`
