# Stage 2: Station & Visual Table Grid Floorplan UI

## Stage Title and Goal
**Stage 2: Restaurant Floorplan UI, Station Grouping & Interactive Table Cards**
The goal of Stage 2 is to introduce a responsive HTML/CSS/JS frontend dashboard for the maïtre d' and host staff of *L'Étoile Noire*. Staff can visually inspect dining stations, view occupancy counts in real-time, filter tables by dining area, and click tables to cycle their state.

## Contributors
- **Google AI Studio**
- **BAND**

---

## Checklist of Completed Items
- [x] Implemented responsive Jinja2 template (`templates/index.html`) with floorplan grid layout.
- [x] Styled stations with luxury Parisian aesthetic using Tailwind CSS & dark theme (`static/css/style.css`).
- [x] Added frontend client logic (`static/js/app.js`) for async status mutation and live polling.
- [x] Extended `app.py` to serve root dashboard view `/` and static assets.
- [x] Added automated UI route and template rendering tests (`test_ui.py`).
- [x] Integrated Google AI Studio and BAND contributor headers in all code files.

---

## Files Created in Stage 2
- `stage-2/app.py`: Updated Flask server serving both Jinja2 HTML dashboard and REST APIs.
- `stage-2/templates/index.html`: Responsive floorplan UI showing station tabs, status badges, and table grid.
- `stage-2/static/css/style.css`: Custom CSS styling for table statuses (`AVAILABLE`, `RESERVED`, `OCCUPIED`, `DIRTY`).
- `stage-2/static/js/app.js`: JavaScript for station filtering, quick status toggling, and real-time DOM updates.
- `stage-2/test_ui.py`: Automated integration test verifying dashboard template rendering and HTTP routes.
- `stage-2/requirements.txt`: Python package requirements for Stage 2.

---

## Features Added
- **Visual Table Grid Layout**: Table cards grouped by station (Terrace, Main Salon, Mezzanine) with seat capacity badges.
- **Interactive Status Cycling**: Maître d' can click on table cards to cycle status from `AVAILABLE` $\to$ `OCCUPIED` $\to$ `DIRTY` $\to$ `AVAILABLE`.
- **Live Station Filtering**: Filter the dining floor by designated server stations or view the complete floorplan.
- **Real-Time Capacity Counter**: Displays total available, occupied, reserved, and dirty seats dynamically.

---

## Bugs Fixed in This Stage
- Fixed table status desynchronization where multiple clicks caused out-of-order race conditions on the UI by disabling buttons during in-flight network requests.
- Prevented layout wrapping issues on mobile viewport sizes by making the table grid responsive with CSS grid autogeneration.

---

## How to Run and Test This Stage
```bash
cd stage-2
pip install -r requirements.txt
python test_ui.py
python app.py
# Open http://localhost:5000 in your browser
```

---

## Dependencies Needed
- Python >= 3.10
- Flask >= 3.0.0
- pytest >= 8.0.0

---

## What Carries Over to Stage 3
- The floorplan dashboard and table cards.
- The station switching interface.
- Prepared modal hooks to attach phone input and guest reservation forms in Stage 3.
