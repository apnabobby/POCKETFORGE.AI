# Stage 4 - Autonomous Dark Factory Stress-Test & Invariant Engine
# Contributors: Google AI Studio, BAND

import os
import sys
import time
import json
import threading
from concurrent.futures import ThreadPoolExecutor
from app import app, init_db, get_db_connection

class DarkFactoryRunner:
    """
    Autonomous Dark Factory testing engine.
    Bombards the restaurant tablekeeper system with concurrency storms,
    phone number fuzzing payloads, and capacity edge cases.
    """
    def __init__(self):
        self.results = []
        self.client = app.test_client()

    def log(self, test_name: str, status: str, details: str):
        record = {
            "test": test_name,
            "status": status,
            "details": details,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        self.results.append(record)
        badge = "✅ PASS" if status == "PASS" else "❌ FAIL"
        print(f"[{badge}] {test_name}: {details}")

    def run_all_vectors(self):
        print("\n" + "="*70)
        print("🏭 L'ÉTOILE NOIRE — AUTONOMOUS DARK FACTORY STRESS RUNNER")
        print("   Contributors: Google AI Studio & BAND")
        print("="*70)

        self.vector_1_concurrent_double_booking()
        self.vector_2_phone_fuzzing()
        self.vector_3_overcapacity_rejection()
        self.vector_4_status_mutation_storm()
        self.vector_5_station_reassignment_safety()

        print("\n" + "-"*70)
        total = len(self.results)
        passed = sum(1 for r in self.results if r["status"] == "PASS")
        failed = sum(1 for r in self.results if r["status"] == "FAIL")
        print(f"📊 SUMMARY: {passed}/{total} VECTORS PASSED ({failed} FAILS)")
        print("="*70 + "\n")
        return {"total": total, "passed": passed, "failed": failed, "results": self.results}

    def vector_1_concurrent_double_booking(self):
        """Vector 1: Fire 10 simultaneous reservation requests at the same Table 2"""
        table_id = 2
        success_count = 0
        rejection_count = 0
        lock = threading.Lock()

        def attempt_booking(idx):
            nonlocal success_count, rejection_count
            payload = {
                "table_id": table_id,
                "guest_name": f"Concurrent Guest #{idx}",
                "guest_phone": f"+3360000000{idx}",
                "party_size": 2,
                "reservation_time": "20:00"
            }
            res = self.client.post("/api/reservations",
                                   data=json.dumps(payload),
                                   content_type="application/json")
            with lock:
                if res.status_code == 201:
                    success_count += 1
                else:
                    rejection_count += 1

        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(attempt_booking, i) for i in range(10)]
            for f in futures:
                f.result()

        if success_count == 1 and rejection_count == 9:
            self.log("DOUBLE_BOOKING_RACE_TEST", "PASS",
                     f"Exactly 1 reservation committed, 9 rejected. Zero double-booking occurred.")
        else:
            self.log("DOUBLE_BOOKING_RACE_TEST", "FAIL",
                     f"Anomaly detected! Successes: {success_count}, Rejections: {rejection_count}")

    def vector_2_phone_fuzzing(self):
        """Vector 2: Fuzz phone input with illegal chars, short strings, and scripts"""
        fuzz_samples = [
            ("javascript:alert(1)", False),
            ("123", False),
            ("++12345678", False),
            ("phone_number", False),
            ("+33 6 12 34 56 78", True),
            ("+1 555-234-5678", True),
        ]
        all_passed = True
        for phone, should_pass in fuzz_samples:
            res = self.client.post("/api/reservations",
                                   data=json.dumps({
                                       "table_id": 6,
                                       "guest_name": "Fuzzer Guest",
                                       "guest_phone": phone,
                                       "party_size": 2,
                                       "reservation_time": "21:00"
                                   }),
                                   content_type="application/json")
            passed = (res.status_code == 201) if should_pass else (res.status_code == 400)
            if not passed:
                all_passed = False

        if all_passed:
            self.log("PHONE_E164_FUZZING_TEST", "PASS", "All malformed phone numbers rejected; valid E.164 accepted.")
        else:
            self.log("PHONE_E164_FUZZING_TEST", "FAIL", "Phone validation logic leaked malformed input.")

    def vector_3_overcapacity_rejection(self):
        """Vector 3: Submit 12 guests for a 2-guest table"""
        res = self.client.post("/api/reservations",
                               data=json.dumps({
                                   "table_id": 1, # Capacity is 2
                                   "guest_name": "Mega Party",
                                   "guest_phone": "+15559998877",
                                   "party_size": 12,
                                   "reservation_time": "19:00"
                               }),
                               content_type="application/json")
        if res.status_code == 400 and "exceeds table capacity" in res.data.decode("utf-8"):
            self.log("OVERCAPACITY_PROTECTION_TEST", "PASS", "Over-capacity booking blocked.")
        else:
            self.log("OVERCAPACITY_PROTECTION_TEST", "FAIL", "Over-capacity booking was not blocked.")

    def vector_4_status_mutation_storm(self):
        """Vector 4: Cycle table through all states rapidly"""
        states = ["OCCUPIED", "DIRTY", "AVAILABLE", "RESERVED", "AVAILABLE"]
        success = True
        for st in states:
            res = self.client.post("/api/tables/4/status",
                                   data=json.dumps({"status": st}),
                                   content_type="application/json")
            if res.status_code != 200:
                success = False
        if success:
            self.log("RAPID_STATUS_TRANSITION_STORM", "PASS", "Table successfully survived fast lifecycle transitions.")
        else:
            self.log("RAPID_STATUS_TRANSITION_STORM", "FAIL", "Status state machine failed during rapid cycling.")

    def vector_5_station_reassignment_safety(self):
        """Vector 5: Delete station and verify associated tables auto-reassigned without null pointers"""
        # Create temp station
        self.client.post("/api/stations", data=json.dumps({
            "id": "temp_balcony", "name": "Balcony", "server_name": "Pierre"
        }), content_type="application/json")

        # Assign table 7 to temp_balcony
        conn = get_db_connection()
        conn.execute("UPDATE tables SET station_id = 'temp_balcony' WHERE id = 7")
        conn.commit()
        conn.close()

        # Delete station
        del_res = self.client.delete("/api/stations/temp_balcony")
        if del_res.status_code == 200:
            # Check table 7 reassigned
            t_res = self.client.get("/api/tables/7")
            t_data = json.loads(t_res.data)
            if t_data["station_id"] == "main_salon":
                self.log("STATION_DECOMMISSION_REASSIGNMENT_TEST", "PASS", "Orphaned tables safely reassigned to main_salon.")
            else:
                self.log("STATION_DECOMMISSION_REASSIGNMENT_TEST", "FAIL", "Table not reassigned to default station.")
        else:
            self.log("STATION_DECOMMISSION_REASSIGNMENT_TEST", "FAIL", "Station deletion failed.")

if __name__ == "__main__":
    init_db()
    runner = DarkFactoryRunner()
    results = runner.run_all_vectors()
    if results["failed"] > 0:
        sys.exit(1)
