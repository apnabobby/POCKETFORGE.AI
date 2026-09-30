# Stage 2 - Automated integration test for Floorplan UI & Jinja template
# Contributors: Google AI Studio, BAND

import os
import unittest
import tempfile
from app import app, init_db

class TestStage2UI(unittest.TestCase):
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

    def test_dashboard_renders(self):
        res = self.client.get("/")
        self.assertEqual(res.status_code, 200)
        html = res.data.decode("utf-8")
        self.assertIn("L'Étoile Noire", html)
        self.assertIn("Google AI Studio", html)
        self.assertIn("BAND", html)
        self.assertIn("T-101", html)
        self.assertIn("Terrasse Royale", html)

    def test_static_css_exists(self):
        res = self.client.get("/static/css/style.css")
        self.assertEqual(res.status_code, 200)
        self.assertIn("table-card", res.data.decode("utf-8"))

    def test_static_js_exists(self):
        res = self.client.get("/static/js/app.js")
        self.assertEqual(res.status_code, 200)
        self.assertIn("DOMContentLoaded", res.data.decode("utf-8"))

if __name__ == "__main__":
    unittest.main()
