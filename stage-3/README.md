# Stage 3: Guest Reservations, Phone Input Validation & Dynamic Station Management

## Stage Title and Goal
**Stage 3: Reservations Engine, E.164 Phone Sanitization & Dynamic Station Configuration**
The goal of Stage 3 is to expand *L'Étoile Noire Tablekeeper* with complete reservation lifecycle management. This introduces a customer reservation entity model, a booking modal with E.164 international phone number format validation, table conflict detection, and endpoints to add/remove server stations on the fly.

## Contributors
- **Google AI Studio**
- **BAND**

---

## Checklist of Completed Items
- [x] Added `reservations` table schema to SQLite database with timestamps, guest names, phone numbers, and guest counts.
- [x] Implemented phone number parsing and regex-based sanitization in E.164 format (`+1...`, `+33...`).
- [x] Built table reservation conflict validation (ensures table capacity >= party size and table is not double-booked).
- [x] Added modal UI in `templates/index.html` allowing host to book a table with guest name and phone.
- [x] Added REST endpoints for reservation creation (`POST /api/reservations`), cancellation (`DELETE /api/reservations/<id>`), and station management (`POST /api/stations`, `DELETE /api/stations/<id>`).
- [x] Automated unit and integration test suite (`test_reservations.py`).
- [x] Integrated Google AI Studio and BAND contributor headers in all code files.

---

## Files Created in Stage 3
- `stage-3/app.py`: Flask application with reservations engine, phone validation, station CRUD, and conflict checks.
- `stage-3/templates/index.html`: Dashboard with reservation modal, phone input field, and station management controls.
- `stage-3/static/css/style.css`: Modal styling, form input design, and reservation badge states.
- `stage-3/static/js/app.js`: Client-side logic for phone sanitization, booking submission, and modal toggles.
- `stage-3/test_reservations.py`: Test suite validating phone validation, booking creation, capacity enforcement, and station add/remove.
- `stage-3/requirements.txt`: Python package requirements for Stage 3.

---

## Features Added
- **Phone Input Box & E.164 Sanitization**: Validates international and local phone inputs (e.g. `+33 6 12 34 56 78` or `+1 555-0199`) before database persistence.
- **Reservation Booking Flow**: Host can click any available table, enter guest name, phone, reservation time, and guest count. Table state transitions automatically to `RESERVED`.
- **Conflict Prevention Engine**: Blocks booking if guest count exceeds table capacity or if the table is already occupied.
- **Dynamic Station Management**: Host can add a new dining station (e.g., "Wine Cellar Lounge") or decommission an unused station with automatic reassignment.

---

## Bugs Fixed in This Stage
- Prevented double-booking race condition by wrapping reservation creation and table status change inside an atomic SQLite transaction block.
- Sanitized phone input strings by stripping illegal punctuation and whitespace before executing database queries.

---

## How to Run and Test This Stage
```bash
cd stage-3
pip install -r requirements.txt
python test_reservations.py
python app.py
```

---

## Dependencies Needed
- Python >= 3.10
- Flask >= 3.0.0
- pytest >= 8.0.0

---

## What Carries Over to Stage 4
- The complete reservation engine and phone validation logic.
- Table and station database schemas.
- The interactive UI and modal system to be connected to the Dark Factory autonomous attack harness in Stage 4.
