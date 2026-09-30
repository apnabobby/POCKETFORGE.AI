# Stage 3 - Concurrency, Idempotency & Integer Unit Tests
# Contributors: BAND Agents (Seat 1: Planner, Seat 2: Implementer, Seat 3: Reviewer)

import os
import unittest
import tempfile
import json
import threading
from concurrent.futures import ThreadPoolExecutor
from app import app, init_db

class TestStage3ConcurrencyAndInvariants(unittest.TestCase):
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

    def test_concurrent_double_spend_race_condition(self):
        """
        Attack Vector (CWE-362): Fire 10 simultaneous transfers of 3,000 INR from Bob (who only has 3,500 INR).
        Exactly 1 must commit and 9 must fail cleanly. Balance must never drop below 0.
        """
        successes = 0
        failures = 0
        lock = threading.Lock()

        def send_concurrent_tx(idx):
            nonlocal successes, failures
            payload = {
                "sender_id": "W-BOB",
                "recipient_id": "W-ALICE",
                "amount_paise": 300000, # ₹3,000
                "idempotency_key": f"RACE-TEST-{idx}"
            }
            res = self.client.post("/api/transfers", data=json.dumps(payload), content_type="application/json")
            with lock:
                if res.status_code == 201:
                    successes += 1
                else:
                    failures += 1

        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(send_concurrent_tx, i) for i in range(10)]
            for f in futures:
                f.result()

        self.assertEqual(successes, 1, "Exactly one concurrent transfer must succeed")
        self.assertEqual(failures, 9, "Remaining 9 attempts must be rejected due to insufficient funds")

        # Verify Bob's final balance
        b_res = self.client.get("/api/wallets/W-BOB")
        b_data = json.loads(b_res.data)
        self.assertEqual(b_data["balance_paise"], 50000) # 350,000 - 300,000 = 50,000p

    def test_float_rejection(self):
        """Invariant 3: Ensure fractional floating point transfers are blocked"""
        payload = {
            "sender_id": "W-ALICE",
            "recipient_id": "W-BOB",
            "amount_paise": 100.5, # Float
            "idempotency_key": "FLOAT-TEST"
        }
        res = self.client.post("/api/transfers", data=json.dumps(payload), content_type="application/json")
        self.assertEqual(res.status_code, 400)
        self.assertIn("INVALID_AMOUNT", json.loads(res.data)["error"])

    def test_idempotent_replay_burst(self):
        """Invariant 4: Replaying same key multiple times never mutates balance twice"""
        payload = {
            "sender_id": "W-ALICE",
            "recipient_id": "W-CHARLIE",
            "amount_paise": 10000,
            "idempotency_key": "REPLAY-BURST-KEY"
        }
        for i in range(5):
            res = self.client.post("/api/transfers", data=json.dumps(payload), content_type="application/json")
            if i == 0:
                self.assertEqual(res.status_code, 201)
            else:
                self.assertEqual(res.status_code, 200)
                data = json.loads(res.data)
                self.assertTrue(data["transaction"]["is_duplicate"])

if __name__ == "__main__":
    unittest.main()
