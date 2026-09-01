import unittest
import os
import json
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import get_db, init_db
from backend.seed import seed_database

class BackendDriverPortalTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        seed_database()
        cls.client = TestClient(app)

    def test_01_health_check(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "ONLINE")
        self.assertIn("SQLite", data["database"])

    def test_02_list_drivers(self):
        response = self.client.get("/api/drivers")
        self.assertEqual(response.status_code, 200)
        drivers = response.json()
        self.assertEqual(len(drivers), 10)
        
        # Verify DRV-7402 exists
        d7402 = next((d for d in drivers if d["driverId"] == "DRV-7402"), None)
        self.assertIsNotNone(d7402)
        self.assertEqual(d7402["name"], "R. Soundararajan")
        self.assertEqual(d7402["assignedRouteCode"], "570")
        self.assertEqual(d7402["assignedVehicleNumber"], "TN-01-N-9982")

    def test_03_driver_route_matching(self):
        """Verify driver route coordinates and stops match homepage route data."""
        response = self.client.get("/api/drivers/DRV-7402/route")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Check driver profile
        self.assertEqual(data["driver"]["driverId"], "DRV-7402")
        self.assertEqual(data["driver"]["name"], "R. Soundararajan")
        
        # Check route
        route = data["route"]
        self.assertEqual(route["id"], "route-570")
        self.assertEqual(route["code"], "570")
        self.assertEqual(route["name"], "CMBT ⇄ Siruseri SIPCOT")
        self.assertGreater(len(route["coordinates"]), 100)
        self.assertEqual(len(route["stops"]), 10)
        self.assertEqual(route["stops"][0]["name"], "CMBT Koyambedu")
        self.assertEqual(route["stops"][-1]["name"], "Siruseri SIPCOT Hub")

        # Check telemetry
        telemetry = data["telemetry"]
        self.assertEqual(telemetry["busId"], "MTC-570-01")
        self.assertEqual(telemetry["vehicleNumber"], "TN-01-N-9982")
        self.assertEqual(telemetry["nextStopName"], "Ashok Pillar")

    def test_04_shift_duration(self):
        response = self.client.get("/api/drivers/DRV-7402/shift")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["driverId"], "DRV-7402")
        self.assertGreater(data["elapsedSeconds"], 0)
        self.assertIn(":", data["elapsedFormatted"])
        self.assertIn(":", data["remainingFormatted"])
        self.assertGreaterEqual(data["shiftProgressPercent"], 0.0)

    def test_05_fatigue_level(self):
        response = self.client.get("/api/drivers/DRV-7402/fatigue")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["driverId"], "DRV-7402")
        self.assertGreaterEqual(data["fatigueScore"], 0)
        self.assertLessEqual(data["fatigueScore"], 100)
        self.assertIn(data["fatigueBand"], ["OPTIMAL", "MODERATE", "HIGH"])
        self.assertTrue(len(data["safetyAdvisory"]) > 0)
        self.assertIn("driveDurationHours", data["factors"])

    def test_06_next_shift(self):
        response = self.client.get("/api/drivers/DRV-7402/next-shift")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["driverId"], "DRV-7402")
        self.assertIn("2026-", data["shiftDate"])
        self.assertEqual(data["vehicleNumber"], "TN-01-N-9982")
        self.assertIn("CMBT", data["reportingDepot"])

    def test_07_shift_change_request_crud(self):
        # 1. Get initial requests
        res_list = self.client.get("/api/drivers/DRV-7402/shift-change")
        self.assertEqual(res_list.status_code, 200)
        init_count = len(res_list.json())

        # 2. Create new shift change request
        payload = {
            "requestedShiftDate": "2026-09-05",
            "requestedShiftType": "MORNING",
            "reasonCategory": "FATIGUE_PREVENTION",
            "reasonDetails": "Requesting morning slot to avoid consecutive night traffic on OMR stretch.",
            "targetDriverId": "DRV-8114"
        }
        res_create = self.client.post("/api/drivers/DRV-7402/shift-change", json=payload)
        self.assertEqual(res_create.status_code, 201)
        created = res_create.json()
        self.assertEqual(created["driverId"], "DRV-7402")
        self.assertEqual(created["requestedShiftDate"], "2026-09-05")
        self.assertEqual(created["status"], "PENDING")

        # 3. Verify it was stored in SQLite
        res_list2 = self.client.get("/api/drivers/DRV-7402/shift-change")
        self.assertEqual(res_list2.status_code, 200)
        new_list = res_list2.json()
        self.assertEqual(len(new_list), init_count + 1)
        self.assertEqual(new_list[0]["requestId"], created["requestId"])

if __name__ == "__main__":
    unittest.main()
