# Stage 1 - Automated unit tests for Tablekeeper REST API
# Contributors: Google AI Studio, BAND

import os
import unittest
import tempfile
import json
from app import app, init_db

class TestStage1API(unittest.TestCase):
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

    def test_health_check(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data["status"], "healthy")
        self.assertIn("Google AI Studio", data["contributors"])
        self.assertIn("BAND", data["contributors"])

    def test_get_tables_list(self):
        res = self.client.get("/api/tables")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertGreater(data["count"], 0)
        self.assertTrue(any(t["table_number"] == "T-101" for t in data["tables"]))

    def test_update_table_status_valid(self):
        res = self.client.post("/api/tables/1/status",
                               data=json.dumps({"status": "OCCUPIED"}),
                               content_type="application/json")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data["table"]["status"], "OCCUPIED")

    def test_update_table_status_invalid(self):
        res = self.client.post("/api/tables/1/status",
                               data=json.dumps({"status": "NONEXISTENT_STATE"}),
                               content_type="application/json")
        self.assertEqual(res.status_code, 400)
        data = json.loads(res.data)
        self.assertIn("error", data)

    def test_get_stations(self):
        res = self.client.get("/api/stations")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(len(data["stations"]), 3)

if __name__ == "__main__":
    unittest.main()
