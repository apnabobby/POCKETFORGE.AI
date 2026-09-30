# Video Compliance & Submission Checklist

> **CRITICAL WARNING**:
> According to BAND Desktop competition instructions, submitting a final video **without the required BAND Desktop room recording can cause direct disqualification**.
> Preparing source code and documentation does NOT replace the manual video recording.

---

## Required Video Demonstration Structure

Your submitted video walkthrough MUST visibly contain the following 5 segments:

### 1. The BAND Desktop Room
- [ ] Show the active BAND Desktop workspace that generated the solution.
- [ ] Visibly display the project title and loaded repository.

### 2. Three Distinct Agent Seats
- [ ] Visibly show **Seat 1 (Planner / Architect)** configured with its generic mandate (`docs/band-agent-mandates.md`).
- [ ] Visibly show **Seat 2 (Implementer)** configured with its generic mandate.
- [ ] Visibly show **Seat 3 (Reviewer / Validator)** configured with its generic mandate.
- [ ] Confirm that standing mandates contain NO hardcoded track-specific paths or internal schemas.

### 3. Agent Development & Handoff Workflow
- [ ] Demonstrate a task being assigned through the BAND interface.
- [ ] Show Seat 1 producing requirements and invariant specifications.
- [ ] Show Seat 2 receiving the task and executing code synthesis/changes.
- [ ] Show Seat 3 independently reviewing, executing adversarial tests, and providing verification feedback.

### 4. Working Solution & Decision Memory UI
- [ ] Run the application locally or in container (`npm run start` or `docker run`).
- [ ] Demonstrate entering a technical question into **Decision Memory AI** (e.g., *"Why integer paise instead of floats?"*).
- [ ] Walk through the 4-part explanation:
  1. What decision was made
  2. Why it was made (with protected invariants)
  3. Alternatives considered & why they were rejected
  4. Supporting evidence (commits, PRs, issue references)

### 5. Dark Factory Adversarial Attack & Self-Repair Demo
- [ ] Click **[RUN FACTORY DEMO]**.
- [ ] Show the visible bug detection (race condition double-spend).
- [ ] Show autonomous diagnosis and patch synthesis by the Repair Agent.
- [ ] Show 50/50 tests passing on retest.
- [ ] Click **[Export Audit]** to show PDF/JSON evidence dossier generation.

---

## Disqualification Checklist Prior to Submission

- [ ] **Did you record the actual BAND Desktop room?** (Required)
- [ ] **Are all three agent seats shown with generic mandates?** (Required)
- [ ] **Is the video within the allowed duration limit specified by the challenge?** (Check hackathon portal rules)
- [ ] **Is the video audio clear, audible, and easy for judges to follow?**
- [ ] **Is the GitHub repository public and cloneable?**
