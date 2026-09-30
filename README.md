# L'Étoile Noire Tablekeeper

> **A luxury restaurant table and reservation management system built with Flask and deployed on Vercel, fortified by an autonomous Dark Factory stress runner.**
>
> **Project Contributors:**
> - **Google AI Studio**
> - **BAND**

---

## 1. Project Overview
*L'Étoile Noire Tablekeeper* is designed for fine-dining restaurant hosts and maîtres d'hôtel. It manages:
- **Interactive Floorplan Grid**: Real-time table states (`AVAILABLE`, `RESERVED`, `OCCUPIED`, `DIRTY`) grouped by dining stations (Terrace, Main Salon, Mezzanine).
- **Guest Reservations with Phone Validation**: E.164 phone sanitization, party size capacity enforcement, and double-booking prevention.
- **Dynamic Station Management**: On-the-fly station creation and safe table reassignment.
- **Dark Factory Autonomous Stress Test Harness (`dark_factory.py`)**: Bombards the system with parallel concurrency bursts and input fuzzing.
- **Vercel Serverless Ready**: WSGI-compliant entrypoint `index.py` with zero-config `vercel.json`.

---

## 2. Stage-Wise Progression Summary (Stages 1 to 4)

| Stage | Focus Area | Key Additions | Verification |
| :--- | :--- | :--- | :--- |
| **Stage 1** | **Core Flask REST API & SQLite DB** | SQLite database schema, stations & tables entities, table status mutation endpoints. | `test_api.py` unit tests pass. |
| **Stage 2** | **Station & Table Floorplan UI** | Jinja2 floorplan dashboard, responsive dark theme styling, live counter metrics, interactive status cycling. | `test_ui.py` template integration tests pass. |
| **Stage 3** | **Reservations & Phone Validation** | E.164 phone sanitization, guest booking modal, conflict prevention engine, dynamic add/remove station endpoints. | `test_reservations.py` tests pass. |
| **Stage 4** | **Dark Factory & Deployment** | Autonomous dark factory runner (`dark_factory.py`), Vercel serverless integration (`index.py`, `vercel.json`), and Dockerfile. | `test_dark_factory.py` 5/5 vectors pass. |

---

## 3. Folder Index & Complete File Tree

```text
.
├── .devcontainer/
│   └── devcontainer.json          # VS Code remote development container spec
├── data/                          # Persistent SQLite database storage
├── mandates/
│   └── dark_factory_mandate.md    # Autonomous test invariants & agent rules
├── outputs/                       # Dark factory reports & run telemetry
├── static/
│   ├── css/
│   │   └── style.css              # Custom styling for table cards and badges
│   └── js/
│       └── app.js                 # Interactive floorplan DOM updates and modal scripts
├── templates/
│   └── index.html                 # Maître d' floorplan dashboard
├── stage-1/
│   ├── README.md                  # Stage 1 documentation and test instructions
│   ├── app.py                     # Stage 1 Flask API and SQLite tables
│   ├── test_api.py                # Stage 1 automated tests
│   └── requirements.txt           # Stage 1 dependencies
├── stage-2/
│   ├── README.md                  # Stage 2 documentation
│   ├── app.py                     # Stage 2 Flask API with dashboard rendering
│   ├── templates/index.html       # Stage 2 floorplan template
│   ├── static/css/style.css       # Stage 2 floorplan styles
│   ├── static/js/app.js           # Stage 2 status cycling JS
│   ├── test_ui.py                 # Stage 2 template render tests
│   └── requirements.txt           # Stage 2 dependencies
├── stage-3/
│   ├── README.md                  # Stage 3 documentation
│   ├── app.py                     # Stage 3 Flask app with phone validation & reservations
│   ├── templates/index.html       # Stage 3 dashboard with booking modals
│   ├── static/css/style.css       # Stage 3 modal styles
│   ├── static/js/app.js           # Stage 3 reservation client script
│   ├── test_reservations.py       # Stage 3 reservation & station tests
│   └── requirements.txt           # Stage 3 dependencies
├── stage-4/
│   ├── README.md                  # Stage 4 documentation
│   ├── app.py                     # Stage 4 production Flask application
│   ├── dark_factory.py            # Stage 4 autonomous stress-test engine
│   ├── index.py                   # Stage 4 Vercel serverless gateway
│   ├── vercel.json                # Stage 4 Vercel deployment configuration
│   ├── Dockerfile                 # Stage 4 production containerfile
│   ├── test_dark_factory.py       # Stage 4 dark factory verification test
│   ├── templates/index.html       # Stage 4 production HTML
│   ├── static/css/style.css       # Stage 4 production CSS
│   ├── static/js/app.js           # Stage 4 production JS
│   └── requirements.txt           # Stage 4 dependencies
├── app.py                         # Root production application (synchronized with Stage 4)
├── dark_factory.py                # Root autonomous dark factory runner
├── index.py                       # Root Vercel entrypoint
├── vercel.json                    # Root Vercel routing configuration
├── Dockerfile                     # Root Docker container specification
├── requirements.txt               # Root production dependencies
└── README.md                      # Main project documentation
```

---

## 4. Setup, Run & Deployment Instructions

### A. Local Execution
```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run the Autonomous Dark Factory Verification
python dark_factory.py

# 3. Start the Flask application
python app.py
```
Open [http://localhost:5000](http://localhost:5000) in your browser.

---

### B. Docker Container Deployment
```bash
# Build Docker image
docker build -t etoile-noire-tablekeeper:latest .

# Run container
docker run -p 5000:5000 etoile-noire-tablekeeper:latest
```

---

### C. Vercel Serverless Deployment
The repository includes `index.py` and `vercel.json` configured for Vercel's Python runtime.
```bash
# Deploy to Vercel
vercel
```
The application dynamically routes `/api/*` and dashboard requests to `index.py` while pointing SQLite to `/tmp/tablekeeper.db`.

---

## 5. Contributors
- **Google AI Studio**
- **BAND**
