# Hackathon Submission Checklist & Compliance Audit

This document tracks all requirements for the BAND Desktop Hackathon submission.

---

## 1. Automated Repository & Code Requirements (Completed by Code)

- [x] **Generic Agent Mandates Created**: `docs/band-agent-mandates.md` defines 3 generic seats (Planner/Architect, Implementer, Reviewer/Validator) with zero track-specific bias.
- [x] **Buildable Stage Structure**: `stage-1/` contains a fully functional, self-contained, buildable service with its own README and verified compilation.
- [x] **Decision Memory Core Implemented**: Searchable technical decision engine explaining *What*, *Why*, *Alternatives Considered*, *Rejected Reasons*, and *Evidence Sources*.
- [x] **Clean Containerization**: `Dockerfile` and `.dockerignore` created for reproducible offline-compatible builds.
- [x] **Zero-Network Ingress Support**: Local deterministic corpus and wallet simulator require no outbound internet traffic to execute.
- [x] **Health Check Endpoint**: `/api/health` reports system status, version, and offline capability.
- [x] **Audit Dossier Export**: One-click PDF and JSON evidence export for judges.

---

## 2. BAND Desktop Manual Steps (Must Be Completed by Developer)

> **IMPORTANT**:
> Code alone cannot interact with your local BAND Desktop application.
> You must manually perform and record the following steps in your BAND Desktop environment:

- [ ] **Step 1: Open Project in BAND Desktop**
  Launch BAND Desktop and open this repository workspace.
- [ ] **Step 2: Create Three Distinct Agent Seats**
  Configure three distinct coding-agent seats:
  - Seat 1: `Planner / Architect`
  - Seat 2: `Implementer`
  - Seat 3: `Reviewer / Validator`
- [ ] **Step 3: Assign Generic Mandates**
  Copy and assign the generic standing mandates from `docs/band-agent-mandates.md` to each respective seat. Ensure no track-specific endpoints are inside the standing mandates.
- [ ] **Step 4: Execute Actual Work Through Seats**
  Pass actual engineering tasks (e.g. from `stage-1/` tasks) through the seats and let them produce plans, implementations, and reviews.
- [ ] **Step 5: Export BAND Desktop Room**
  Use BAND Desktop's native export feature to export the room session required by competition rules.
- [ ] **Step 6: Record BAND Desktop Room for Video**
  Capture high-resolution video of the active BAND Desktop room, the seats, and the agent interaction workflow.
- [ ] **Step 7: Archive Evidence & Screenshots**
  Save screenshots of the three configured seats and the conversation thread.
- [ ] **Step 8: Verify Public Repository**
  Ensure the GitHub repository is public, cloneable, and contains all stage and doc files.

---

## 3. Disqualification Safety ("DO NOT DO" Rules)

To ensure your submission is not disqualified by evaluators, strictly adhere to the following rules:

### DO NOT:
1. **DO NOT** put track-specific details, project-specific endpoint paths (`/api/...`), database field names, or error codes into the generic standing agent mandates in BAND Desktop.
2. **DO NOT** create fake agent seats that are not actually configured or utilized in BAND Desktop.
3. **DO NOT** create fake stage folders (`stage-2`, `stage-3`, etc.) that do not contain a buildable, runnable service. Only submit stages that are verified buildable.
4. **DO NOT** claim BAND Desktop usage without actually opening and operating the project in BAND Desktop.
5. **DO NOT** claim a BAND room export exists unless the room file was actually exported and included.
6. **DO NOT** submit a final video without showing the required BAND Desktop room recording (explicit competition rule).
7. **DO NOT** rely on outbound internet access during clean-container execution.
8. **DO NOT** claim the service passed an official no-network container test unless it was explicitly executed and proven in that runner.
