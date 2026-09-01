import time
import os
from playwright.sync_api import sync_playwright

def test_driver_3d_transition():
    print("Starting 3D Bus Rear-Zoom & Driver Transition E2E Test...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # 1. Load Homepage on port 5175
        print("1. Navigating to Homepage http://localhost:5175/ ...")
        page.goto("http://localhost:5175/", wait_until="networkidle", timeout=15000)
        time.sleep(2)
        page.screenshot(path="public/e2e_transition_1_homepage.png")
        print("   Homepage loaded screenshot saved.")

        # 2. Click Driver Portal to open dropdown
        print("2. Clicking Driver Portal to expand Pilot Dropdown...")
        driver_portal_toggle = page.locator("button:has-text('Driver Portal')").first
        driver_portal_toggle.click()
        time.sleep(1)
        page.screenshot(path="public/e2e_transition_2_dropdown_open.png")
        print("   Dropdown open screenshot saved.")

        # 3. Verify pilots in dropdown
        page.wait_for_selector("text=R. Soundararajan", timeout=5000)
        page.wait_for_selector("text=K. Murugesan", timeout=5000)

        # 4. Click 'K. Murugesan (DRV-8114)' to trigger 3D Rear-Zoom Transition
        print("4. Selecting K. Murugesan (DRV-8114) to trigger 3D focus & rear-zoom...")
        murugesan_btn = page.locator("button:has-text('K. Murugesan')").first
        murugesan_btn.click()

        # 5. Capture 3D Intercept Stage
        time.sleep(0.4)
        page.screenshot(path="public/e2e_transition_3_3d_intercept.png")
        print("   Stage 1: 3D Intercept screenshot saved.")

        # 6. Capture 3D Rear-Zoom & Hyperloop Wormhole Stage
        time.sleep(0.7)
        page.screenshot(path="public/e2e_transition_4_3d_rear_zoom.png")
        print("   Stage 2: 3D Rear-Zoom screenshot saved.")

        # 7. Capture Cockpit Warp Stage
        time.sleep(0.6)
        page.screenshot(path="public/e2e_transition_5_cockpit_warp.png")
        print("   Stage 3: Cockpit Warp screenshot saved.")

        # 8. Wait for seamless handover to Driver Portal
        print("8. Waiting for seamless arrival at Driver Portal...")
        page.wait_for_url("**/driver?driverId=DRV-8114", timeout=10000)
        time.sleep(2)
        page.wait_for_selector("text=Active Shift Duration", timeout=10000)
        page.wait_for_selector("text=Fatigue Level & Safety Status", timeout=10000)
        page.screenshot(path="public/e2e_transition_6_portal_loaded.png")
        print(f"   Driver Portal loaded! Current URL: {page.url}")

        browser.close()
        print(">>> ALL 3D REAR-ZOOM & DRIVER TRANSITION TESTS PASSED PERFECTLY! <<<")

if __name__ == "__main__":
    test_driver_3d_transition()
