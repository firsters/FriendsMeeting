from playwright.sync_api import sync_playwright

def verify_markers():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Grant geolocation permission
        context = browser.new_context(
            permissions=['geolocation'],
            geolocation={'latitude': 37.5665, 'longitude': 126.9780}
        )
        page = context.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:5173")

        # Wait for either map or dev mode text
        print("Waiting for page load...")
        # Since we modified App.jsx to go to MAP, we expect MapComponent

        # In Dev Mode (no API key), we look for the user marker div
        # The user marker is rendered as:
        # <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white ...">

        selector = ".bg-blue-500.rounded-full.border-2.border-white"

        try:
            print(f"Waiting for selector: {selector}")
            page.wait_for_selector(selector, timeout=10000)
            print("SUCCESS: User Marker FOUND!")

            # Take success screenshot
            page.screenshot(path="marker_success.png")

        except Exception as e:
            print(f"FAILURE: User Marker NOT found within timeout. Error: {e}")
            # Take failure screenshot
            page.screenshot(path="marker_failure.png")

            # Check if Dev Mode text is present
            if page.locator("text=Dev Mode: No API Key").is_visible():
                print("Info: 'Dev Mode: No API Key' text IS visible.")
            else:
                print("Info: 'Dev Mode' text is NOT visible.")

            # print page content for debugging
            # print(page.content())

        browser.close()

if __name__ == "__main__":
    verify_markers()
