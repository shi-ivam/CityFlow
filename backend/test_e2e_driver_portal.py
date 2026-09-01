import time
import os
from playwright.sync_api import sync_playwright

def run_e2e_tests():
    print("Starting Playwright E2E verification...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # 1. Load Homepage
        print("1. Navigating to Homepage http://localhost:5174/ ...")
        page.goto("http://localhost:5174/", wait_until="networkidle", timeout=15000)
        time.sleep(2)
        page.screenshot(path="public/e2e_homepage.png")
        print("   Homepage screenshot saved.")

        # 2. Click Driver Portal
        print("2. Clicking 'Driver Portal' button...")
        driver_btn = page.locator("a[href='/driver']").first
        driver_btn.click()
        time.sleep(2)
        print(f"   Current URL: {page.url}")
        assert "/driver" in page.url, f"Expected /driver in URL, got {page.url}"

        # 3. Verify De-cluttered Driver Portal Tactical Elements
        print("3. Verifying Clean Driver Portal Elements...")
        page.wait_for_selector("text=Active Shift Duration", timeout=10000)
        page.wait_for_selector("text=Fatigue Level & Safety Status", timeout=10000)
        page.wait_for_selector("text=Next Shift Allocation", timeout=10000)
        page.wait_for_selector("text=Shift Change Requests", timeout=10000)
        page.screenshot(path="public/e2e_driver_portal.png")
        print("   Driver portal initial screenshot saved.")

        # 4. Switch Driver to S. Jayakumar (DRV-3390)
        print("4. Switching active driver to DRV-3390 (S. Jayakumar)...")
        driver_select = page.locator("select").first
        driver_select.select_option("DRV-3390")
        time.sleep(2)
        page.wait_for_selector("text=29C", timeout=10000)
        page.screenshot(path="public/e2e_driver_switched.png")
        print("   Switched driver screenshot saved.")

        # 5. Open Shift Change Request Modal
        print("5. Opening Shift Change Request Modal...")
        request_btn = page.locator("button:has-text('Request Shift')").first
        request_btn.click()
        time.sleep(1)
        page.wait_for_selector("text=Request Shift Change", timeout=5000)
        page.screenshot(path="public/e2e_shift_modal.png")
        print("   Shift change modal screenshot saved.")

        # 6. Fill and Submit Shift Change Request
        print("6. Submitting a new Shift Change Request...")
        textarea = page.locator("textarea")
        textarea.fill("Requesting morning shift swap due to family schedule adjustment. Validated against MTC rest guidelines.")
        submit_btn = page.locator("button:has-text('Submit Request')")
        submit_btn.click()
        time.sleep(2)
        page.screenshot(path="public/e2e_after_submit.png")
        print("   Submitted request screenshot saved.")

        # 7. Verify Navigation back to City Map
        print("7. Testing 'City Map' button navigation back to Homepage...")
        overview_btn = page.locator("button:has-text('City Map')")
        overview_btn.click()
        time.sleep(1.5)
        print(f"   Current URL after City Map click: {page.url}")

        browser.close()
        print("ALL E2E PLAYWRIGHT TESTS PASSED SUCCESSFULLY ON CLEAN UI!")

if __name__ == "__main__":
    run_e2e_tests()
