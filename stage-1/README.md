# Stage 1: Decision Memory AI & Dark Factory Core Service

## Stage Title and Goal
**Stage 1: Autonomous Dark Factory Architecture, Integer Paise Wallet Engine & Decision Memory Core**
The goal of Stage 1 is to provide a self-contained, buildable service featuring:
1. Autonomous multi-agent dark factory pipeline (Planner, Architect, Implementer, Reviewer, Repairer).
2. Double-entry minor unit (paise) financial engine with mutex locks and two-phase rollback.
3. Queryable Decision Memory engine with git commit and test citations.
4. Visual Threat Intelligence Heatmap with CWE vulnerability topologies.

## Contributors
- **Google AI Studio**
- **BAND**

---

## Checklist of Completed Items
- [x] Initialized Vite + React + TypeScript single-page application with Express backend (`server.ts`).
- [x] Built the 5 core financial invariants and wallet simulator (`src/services/walletEngine.ts`).
- [x] Implemented local deterministic Decision Memory retrieval engine (`src/services/decisionMemory.ts`).
- [x] Implemented 50-attack adversarial test suite (`src/services/adversarialRunner.ts`).
- [x] Implemented Visual Threat Intelligence Heatmap (`src/components/ThreatIntelligenceHeatmap.tsx`).
- [x] Generated cryptographic SHA-256 evidence audit trail (`src/services/evidenceLedger.ts`).
- [x] Verified independent compilation with `npm run build` and `npm run lint`.

---

## Files in Stage 1
- `stage-1/src/`: Complete React SPA source code.
- `stage-1/server.ts`: Express API server with offline decision memory and optional Gemini integration.
- `stage-1/package.json`: NPM package configuration.
- `stage-1/tsconfig.json`: TypeScript configuration.
- `stage-1/vite.config.ts`: Vite build tooling setup.
- `stage-1/index.html`: Client web entrypoint.

---

## How to Run & Verify
```bash
cd stage-1
npm install
npm run build
npm run dev
```

---

## Dependencies Needed
- Node.js >= 20
- React 19
- Vite 8
- Express 4
- Lucide React
- Tailwind CSS
