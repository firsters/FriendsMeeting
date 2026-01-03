from playwright.sync_api import sync_playwright, expect
import time

def verify_join_screen():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 375, 'height': 812})
        page = context.new_page()

        print("Navigating directly to Group Join with code...")
        page.goto("http://localhost:5173/?group_code=TEST12")

        try:
            # Use a more specific selector (Heading)
            expect(page.get_by_role("heading", name="모임 참가")).to_be_visible(timeout=10000)
            print("Join screen heading visible.")

            page.screenshot(path="verification/group_join_screen.png")
            print("Screenshot saved: group_join_screen.png")
        except Exception as e:
            print(f"Failed to find element: {e}")
            page.screenshot(path="verification/error_state.png")

        browser.close()

if __name__ == "__main__":
    verify_join_screen()
