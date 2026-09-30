# Stage 1: Core Flask REST API & SQLite Database Setup

## Stage Title and Goal
**Stage 1: Core REST API, Database Engine & Table State Management**
The goal of Stage 1 is to establish the backend foundation for *L'Étoile Noire Tablekeeper*, configuring the SQLite database, table entity models (id, name, capacity, station_id, status), and core REST API endpoints with integer sanity checks and status transitions.

## Contributors
- **Google AI Studio**
- **BAND**

---

## Checklist of Completed Items
- [x] Initialized Flask application with configurable environment variables.
- [x] Configured SQLite database with seed data for Parisian fine dining tables (Terrace, Main Salon, Mezzanine).
- [x] Implemented REST API endpoints for table listing, status mutation, and station queries.
- [x] Added automated API unit tests validating status transitions and error cases.
- [x] Integrated Google AI Studio and BAND contributor headers in all code files.

---

## Files Created in Stage 1
- `stage-1/app.py`: Flask application factory, database initialization, and REST API route handlers.
- `stage-1/test_api.py`: Automated pytest/unittest suite verifying table endpoints, status updates, and error handling.
- `stage-1/requirements.txt`: Python package requirements for Stage 1 (Flask, pytest).

---

## Features Added
- **SQLite Database Setup**: Auto-seeded table schemas with station associations and capacity constraints.
- **REST API Endpoints**:
  - `GET /api/tables`: List all tables and current occupancy state.
  - `GET /api/tables/<id>`: Get single table details.
  - `POST /api/tables/<id>/status`: Atomically update table status (`AVAILABLE`, `OCCUPIED`, `RESERVED`, `DIRTY`).
  - `GET /api/health`: System health and status check.
- **Strict Invariants**: Validates table status transitions and capacity boundaries.

---

## Bugs Fixed in This Stage
- Prevented invalid table status string mutations by enforcing an enumeration whitelist (`AVAILABLE`, `RESERVED`, `OCCUPIED`, `DIRTY`).
- Ensured SQLite handles foreign key constraints and atomic connection rollbacks on database locked errors.

---

## How to Run and Test This Stage
```bash
cd stage-1
pip install -r requirements.txt
# Run the test suite
python test_api.py
# Run the Flask development server
python app.py
```

---

## Dependencies Needed
- Python >= 3.10
- Flask >= 3.0.0
- pytest >= 8.0.0

---

## What Carries Over to Stage 2
- The database schema and table entity model.
- Core REST API endpoints (`/api/tables`, `/api/tables/<id>/status`).
- Station grouping logic used to render the visual floorplan in Stage 2.
