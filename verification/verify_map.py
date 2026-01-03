from playwright.sync_api import sync_playwright

def verify_app_loads():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to app...")
            page.goto("http://localhost:5173")

            # Wait for main container to ensure app loaded
            # The MapComponent renders a div with class "relative w-full h-full" inside CombinedView
            # We can look for the "Meet Friends" text or similar
            # The header has "search" icon

            print("Waiting for content...")
            page.wait_for_selector("header", timeout=10000)

            # Take a screenshot
            print("Taking screenshot...")
            page.screenshot(path="verification/app_view.png")
            print("Screenshot saved.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_app_loads()
