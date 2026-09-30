# Stage 1: Decision Memory AI Core Service

## 1. Stage Overview
**Stage 1** delivers the verified, self-contained core service for **Decision Memory AI**.
It includes:
- **Decision Memory Engine**: Searchable architectural explanations answering *What decision was made*, *Why it was made*, *Rejected alternatives*, and *Supporting evidence citations*.
- **Autonomous Software Factory Pipeline**: 6-agent orchestration loop (Planner, Architect, Builder, Adversarial Tester, Independent Verifier, Repairer).
- **Wallet Financial Engine**: Minor-unit integer paise math, per-wallet serializable mutex queue, atomic snapshot rollback, and idempotency store.
- **REST APIs & Health Endpoint**: `/api/health` and `/api/decisions`.
- **Zero-Network Offline Ingress**: Operates 100% locally with sample deterministic corpus.

---

## 2. Dependencies & Build Verification
This stage contains its own `package.json`, TypeScript configuration, and server runtime.

### Clean Installation
```bash
npm install
```

### Type Checking & Lint
```bash
npm run lint
```

### Production Build
```bash
npm run build
```

### Run Locally
```bash
npm run start
```
The service will start on port `3000` (or `PORT` environment variable).

---

## 3. Verified Features in Stage 1
1. **Developer Ingress**: Search bar for querying technical architectural decisions.
2. **Four-Part Explanations**: What, Why, Rejected Alternatives, and Git/Issue citations.
3. **Adversarial Test Suite**: 50 attack vectors proving race condition resistance and financial conservation.
4. **Audit Dossier Export**: Formatted PDF and raw JSON evidence exports.
5. **Clean Health Check**: Verifiable at `GET /api/health`.

---

## 4. Stage Status
- **Build Status**: Verified PASS (`npm run build` succeeds).
- **Runtime Dependency**: Zero outbound network requirement.
