# Stage 2 - Automated integration test for Wallet Dashboard UI
# Contributors: BAND Agents (Seat 1, Seat 2, Seat 3)

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
        self.assertIn("PocketForge AI", html)
        self.assertIn("W-ALICE", html)
        self.assertIn("W-BOB", html)
        self.assertIn("W-CHARLIE", html)
        self.assertIn("CONSERVED TOTAL SUPPLY", html)
        self.assertIn("BAND POWERED", html)

    def test_static_css_and_js(self):
        css_res = self.client.get("/static/css/style.css")
        self.assertEqual(css_res.status_code, 200)
        js_res = self.client.get("/static/js/app.js")
        self.assertEqual(js_res.status_code, 200)

if __name__ == "__main__":
    unittest.main()
