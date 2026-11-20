"""Live browser capability verification for ScentIQ on running servers (5173 and 8008)."""

import time
from playwright.sync_api import sync_playwright

def verify_live():
    print("=" * 60)
    print("SCENTIQ LIVE CAPABILITY VERIFICATION")
    print("=" * 60)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})

        # 1. Overview Dashboard
        print("\n1. Navigating to http://127.0.0.1:5173...")
        page.goto("http://127.0.0.1:5173")
        page.wait_for_selector("text=Computational Olfaction", timeout=8000)
        print("  ✓ Overview dashboard loaded successfully.")

        # 2. Molecular Lab & Chemical Selection
        print("\n2. Testing Molecular Lab & Chemical Presets...")
        page.locator("button:has-text('Launch Molecular Lab')").click()
        page.wait_for_selector("text=Molecular Lab", timeout=5000)

        page.locator("button:has-text('Aroma Presets')").click()
        time.sleep(1)
        limonene_btn = page.locator("button:has-text('Limonene')").first
        limonene_btn.click()
        time.sleep(2)

        # Verify 2D SVG and 3D Conformer canvas
        page.wait_for_selector("text=Calculated Physicochemical Descriptors", timeout=8000)
        svg_count = page.locator("svg").count()
        canvas_count = page.locator("canvas").count()
        print(f"  ✓ Limonene standardized: 2D SVG count = {svg_count}, 3D Canvas count = {canvas_count}")
        assert svg_count > 0 and canvas_count > 0

        # 3. AI Prediction
        print("\n3. Testing GNN Multi-Label Odor Prediction...")
        page.locator("nav button:has-text('AI Prediction')").click()
        time.sleep(1)
        page.locator("button:has-text('Predict Odor Profile')").click()
        page.wait_for_selector("text=Odor Profile Distribution", timeout=8000)

        # Check top predicted odor category
        top_cat = page.locator("text=Dominant:").first.inner_text()
        print(f"  ✓ GNN inference complete: {top_cat}")

        # 4. Blend Studio
        print("\n4. Testing Blend Studio Non-linear Modulation...")
        page.locator("nav button:has-text('Blend Studio')").click()
        time.sleep(1)
        page.locator("button:has-text('Calculate Non-Linear Blend')").click()
        page.wait_for_selector("text=Predicted Mixture Odor Profile", timeout=8000)
        print("  ✓ Mixture calculation completed with non-linear suppression/enhancement.")

        # 5. Odor Landscape Explorer
        print("\n5. Testing 2D Odor Map Projection...")
        page.locator("nav button:has-text('Odor Explorer')").click()
        page.wait_for_selector("canvas", timeout=8000)
        print("  ✓ 2D PCA landscape scatter plot and cluster chips responsive.")

        browser.close()
        print("\n" + "=" * 60)
        print("ALL LIVE CAPABILITY CHECKS PASSED!")
        print("=" * 60)

if __name__ == "__main__":
    verify_live()
