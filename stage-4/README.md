# Stage 4: Dark Factory Autonomous Stress-Test Engine, Vercel Serverless & Production Deployment

## Stage Title and Goal
**Stage 4: Autonomous Dark Factory Validation, Vercel Serverless Integration & Docker Containerization**
The goal of Stage 4 is to produce the final, battle-tested production release of *L'Étoile Noire Tablekeeper*. This incorporates the `dark_factory.py` autonomous red-team stress test suite (which attacks the reservation system with concurrency storms, invalid phone payloads, and over-capacity bookings), the Vercel serverless entrypoint `index.py`, `vercel.json`, and a standalone production `Dockerfile`.

## Contributors
- **Google AI Studio**
- **BAND**

---

## Checklist of Completed Items
- [x] Implemented `dark_factory.py` autonomous test engine simulating 50 concurrent seat requests, phone fuzzing, and station failure recoveries.
- [x] Configured Vercel serverless gateway `index.py` exporting WSGI application.
- [x] Configured `vercel.json` routing configuration for zero-config serverless deployment.
- [x] Built multi-stage production `Dockerfile` with minimal footprint.
- [x] Added automated Dark Factory verification script (`test_dark_factory.py`).
- [x] Formulated complete root-level deployment files synchronized with Stage 4.
- [x] Integrated Google AI Studio and BAND contributor headers in all code files.

---

## Files Created in Stage 4
- `stage-4/app.py`: Production Flask application with Dark Factory telemetry hook and complete reservation/station APIs.
- `stage-4/dark_factory.py`: Autonomous dark factory attack suite running 50 stress vectors (concurrency, fuzzing, capacity overload).
- `stage-4/index.py`: Vercel serverless WSGI entrypoint.
- `stage-4/vercel.json`: Vercel routing and serverless function configuration.
- `stage-4/Dockerfile`: Container specification for isolated production runs.
- `stage-4/requirements.txt`: Full production Python dependencies.
- `stage-4/templates/index.html`: Production dashboard with live Dark Factory diagnostic trigger.
- `stage-4/static/css/style.css`: Final UI styles.
- `stage-4/static/js/app.js`: Final client application script.
- `stage-4/test_dark_factory.py`: Integration test verifying the autonomous dark factory runner.

---

## Features Added
- **Dark Factory Autonomous Stress Test Harness (`dark_factory.py`)**: Runs parallel threads attacking the Tablekeeper system with:
  1. *Concurrent Double-Booking Floods*: Fires 10 simultaneous reservation requests at the same table; verifies exactly one commits and nine fail cleanly.
  2. *E.164 Phone Fuzzer*: Submits corrupted, alphanumeric, and malformed phone numbers to guarantee rejection.
  3. *Over-Capacity Exploits*: Verifies party sizes > table capacity are blocked.
  4. *Station Deletion Safety*: Deletes an active station and verifies its orphaned tables are safely reassigned to the default station without database corruption.
- **Vercel Serverless Ready (`index.py`, `vercel.json`)**: Allows 1-click deployment to Vercel with zero server overhead.
- **Containerized Packaging (`Dockerfile`)**: Production-ready container image for local, Docker Compose, or Kubernetes deployments.

---

## Bugs Fixed in This Stage
- Neutralized SQLite `database is locked` concurrency crashes during parallel booking bursts by setting `timeout=20.0` and enabling SQLite WAL mode (`PRAGMA journal_mode=WAL`).
- Resolved Vercel read-only filesystem constraint by redirecting SQLite database storage to `/tmp/tablekeeper.db` when running in a serverless environment.

---

## How to Run and Test This Stage
```bash
cd stage-4
pip install -r requirements.txt
# Run the autonomous dark factory test suite
python dark_factory.py
# Run the test suite
python test_dark_factory.py
# Run production app
python app.py
```

---

## Dependencies Needed
- Python >= 3.10
- Flask >= 3.0.0
- pytest >= 8.0.0

---

## Deployment Instructions
- **Vercel**: Deploy using `vercel deploy` with `vercel.json` and `index.py`.
- **Docker**: Build with `docker build -t etoile-noire-tablekeeper .` and run `docker run -p 5000:5000 etoile-noire-tablekeeper`.
