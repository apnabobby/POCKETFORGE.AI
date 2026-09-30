# Stage 1 - Automated unit tests for Pocketful Wallet REST API
# Contributors: BAND Agents (Seat 1: Planner/Architect, Seat 2: Implementer, Seat 3: Reviewer/Validator)

import os
import unittest
import tempfile
import json
from app import app, init_db

class TestStage1WalletAPI(unittest.TestCase):
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
        self.assertEqual(data["track"], "Pocketful")
        self.assertIn("BAND Seat 1 (Planner)", data["contributors"])

    def test_get_wallets_initial_state(self):
        res = self.client.get("/api/wallets")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data["count"], 3)
        self.assertEqual(data["total_supply_paise"], 1850000) # ₹18,500.00 total money

    def test_successful_transfer(self):
        payload = {
            "sender_id": "W-ALICE",
            "recipient_id": "W-BOB",
            "amount_paise": 50000, # ₹500.00
            "idempotency_key": "IDEMP-TEST-001"
        }
        res = self.client.post("/api/transfers",
                               data=json.dumps(payload),
                               content_type="application/json")
        self.assertEqual(res.status_code, 201)
        data = json.loads(res.data)
        self.assertEqual(data["transaction"]["status"], "COMMITTED")

        # Verify balances
        a_res = self.client.get("/api/wallets/W-ALICE")
        a_data = json.loads(a_res.data)
        self.assertEqual(a_data["balance_paise"], 450000)

        b_res = self.client.get("/api/wallets/W-BOB")
        b_data = json.loads(b_res.data)
        self.assertEqual(b_data["balance_paise"], 400000)

    def test_idempotent_duplicate_retry(self):
        payload = {
            "sender_id": "W-ALICE",
            "recipient_id": "W-BOB",
            "amount_paise": 20000,
            "idempotency_key": "IDEMP-RETRY-001"
        }
        r1 = self.client.post("/api/transfers", data=json.dumps(payload), content_type="application/json")
        self.assertEqual(r1.status_code, 201)

        r2 = self.client.post("/api/transfers", data=json.dumps(payload), content_type="application/json")
        self.assertEqual(r2.status_code, 200)
        d2 = json.loads(r2.data)
        self.assertTrue(d2["transaction"]["is_duplicate"])

    def test_overdraft_rejected(self):
        payload = {
            "sender_id": "W-BOB", # has 350000p
            "recipient_id": "W-ALICE",
            "amount_paise": 9999999,
            "idempotency_key": "IDEMP-OVERDRAFT"
        }
        res = self.client.post("/api/transfers", data=json.dumps(payload), content_type="application/json")
        self.assertEqual(res.status_code, 400)
        self.assertIn("Insufficient funds", json.loads(res.data)["error"])

if __name__ == "__main__":
    unittest.main()
