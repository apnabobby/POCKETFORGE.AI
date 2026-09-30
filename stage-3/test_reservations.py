# Stage 3 - Automated test suite for Reservations, Phone Validation & Stations
# Contributors: Google AI Studio, BAND

import os
import unittest
import tempfile
import json
from app import app, init_db, sanitize_phone

class TestStage3Reservations(unittest.TestCase):
    def setUp(self):
        self.db_fd, self.db_path = tempfile.mkstemp()
        os.environ["DATABASE_PATH"] = self.db_path
        app.config["TESTING"] = True
        self.client = app.test_client()
        init_db()

    def tearDown(self):
        os.close(self.db_fd)
        if os.path.exists(self.db_path):
            os.unlink(self.db_path)

    def test_phone_sanitization_valid(self):
        self.assertEqual(sanitize_phone("+33 6 12 34 56 78"), "+33612345678")
        self.assertEqual(sanitize_phone("+1 (555) 234-5678"), "+15552345678")
        self.assertEqual(sanitize_phone("5551234567"), "+5551234567")

    def test_phone_sanitization_invalid(self):
        self.assertEqual(sanitize_phone("abc"), "")
        self.assertEqual(sanitize_phone("123"), "")

    def test_create_reservation_success(self):
        payload = {
            "table_id": 1,
            "guest_name": "Madame Curie",
            "guest_phone": "+33 6 99 88 77 66",
            "party_size": 2,
            "reservation_time": "20:30",
            "notes": "Window seat preferred"
        }
        res = self.client.post("/api/reservations",
                               data=json.dumps(payload),
                               content_type="application/json")
        self.assertEqual(res.status_code, 201)
        data = json.loads(res.data)
        self.assertEqual(data["reservation"]["guest_phone"], "+33699887766")

        # Verify table status changed to RESERVED
        t_res = self.client.get("/api/tables/1")
        t_data = json.loads(t_res.data)
        self.assertEqual(t_data["status"], "RESERVED")

    def test_reservation_capacity_exceeded(self):
        payload = {
            "table_id": 1, # Capacity is 2
            "guest_name": "Party of Eight",
            "guest_phone": "+1 555-999-0000",
            "party_size": 8,
            "reservation_time": "19:00"
        }
        res = self.client.post("/api/reservations",
                               data=json.dumps(payload),
                               content_type="application/json")
        self.assertEqual(res.status_code, 400)
        data = json.loads(res.data)
        self.assertIn("exceeds table capacity", data["error"])

    def test_add_and_remove_station(self):
        # Add new station
        res = self.client.post("/api/stations",
                               data=json.dumps({
                                   "id": "vip_patio",
                                   "name": "VIP Garden Patio",
                                   "server_name": "Antoine"
                               }),
                               content_type="application/json")
        self.assertEqual(res.status_code, 201)

        # Delete station
        del_res = self.client.delete("/api/stations/vip_patio")
        self.assertEqual(del_res.status_code, 200)

if __name__ == "__main__":
    unittest.main()
