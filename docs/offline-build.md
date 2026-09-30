# Clean Build & Offline Container Guide

## 1. Clean Build & No-Network Principles

Competition criteria require the final service to build and execute cleanly inside an isolated container with **no outbound network access** at runtime.

### Design Principles Applied:
1. **Decoupled External APIs**: The service operates with a deterministic local decision memory corpus and an autonomous state machine that does not require external GitHub or LLM API calls to run.
2. **Deterministic Sample Data**: Initial wallet balances, transactions, and historical decision memory citations are stored locally.
3. **Graceful Offline Fallback**: If `GEMINI_API_KEY` is absent or outbound traffic is blocked, server routes fall back to local deterministic execution with full fidelity.
4. **Health Check Endpoint**: `/api/health` reports status, version, and confirmation of offline capability.

---

## 2. Docker Build & Execution

### Build Docker Image
```bash
docker build -t decision-memory-ai:latest .
```

### Run Container in Isolated / Offline Network
To run the container and simulate strict no-internet runtime constraints:

```bash
docker run --rm -p 3000:3000 --network none decision-memory-ai:latest
```
*(Or in standard mode if port mapping is needed on standard host network:)*
```bash
docker run --rm -p 3000:3000 decision-memory-ai:latest
```

---

## 3. Verifying Health & Offline Ingress

### Health Endpoint
```bash
curl http://localhost:3000/api/health
```
**Expected Response:**
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

### Decision Memory REST Query
```bash
curl "http://localhost:3000/api/decisions?q=paise"
```
**Expected Response:**
Returns matching architectural decisions (`DEC-001`), rejected alternatives, and git commit citations without any outbound internet call.

---

## 4. Container Build Testing Notice
> **COMPLIANCE NOTICE**:
> Do NOT claim the service has passed a specific no-network container test on the competition evaluation server until it has been explicitly run and validated in that specific runner. Local container execution instructions above provide the reproducible recipe.
