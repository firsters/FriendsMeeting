from playwright.sync_api import sync_playwright

def verify_search_inputs():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app
        page.goto("http://localhost:5173")

        # 1. Onboarding Screen -> Login Screen
        page.get_by_text("로그인").click()

        # 2. Login Screen -> Mock Login
        # Use more robust selector logic based on page content analysis
        # "이메일" label is above input. Input placeholder is "이메일 주소를 입력하세요"
        # "비밀번호" label is above input. Input placeholder is "••••••••"

        page.wait_for_selector("input[type='email']")
        page.locator("input[type='email']").fill("test@example.com")

        # Password
        page.locator("input[type='password']").fill("password123")

        # Click Login Button
        # The button has text "로그인" and icon "login"
        page.locator("button:has-text('로그인')").click()

        # 3. Permissions Screen -> Map
        try:
            # Wait for either map input OR permission button
            # Permissions screen has "다음에" (Skip/Later) maybe?
            # Or "허용" (Allow)
            # Let's check CombinedView specific element: input[placeholder*='장소 검색']
            # Or Permissions specific: text-4xl "권한 설정" or similar

            # Wait 2 seconds to see where we are
            page.wait_for_timeout(2000)

            if page.get_by_text("권한 설정").is_visible() or page.get_by_text("다음에").is_visible():
                print("On Permissions Screen")
                if page.get_by_text("다음에").is_visible():
                    page.get_by_text("다음에").click()
                else:
                    # Look for continue button
                    page.locator("button").last.click()
        except:
            print("No permission screen or skipped")

        # 4. Map Screen
        # Wait for search input
        page.wait_for_selector("input[placeholder*='장소 검색']", timeout=10000)

        # 1. Primary Search (Host)
        # Check if edit toggle is there (isHost check)
        # NOTE: If we mock login, are we host? `isHost` in CombinedView depends on `auth.currentUser`.
        # Firebase mock usually sets a user, so yes.

        # The edit button has 'edit_location' icon.
        # But if it's already open (default is false), we see text.
        # Actually default is closed.

        edit_btn = page.locator("button span:has-text('edit_location')")
        if edit_btn.is_visible():
            print("Host mode detected, opening search")
            edit_btn.click() # Open search

        # Find the input
        search_input = page.locator("input[placeholder*='장소 검색']").first

        if search_input.is_visible():
            search_input.click()
            search_input.fill("Gangnam")
            search_input.press("Enter")
            page.wait_for_timeout(1000)
            page.screenshot(path="verification/step1_primary_enter.png")
            print("Primary search test complete")
        else:
            print("Primary search input not visible (maybe not host?)")

        # 2. General Search (Row 2)
        # Click expand button
        expand_btn = page.locator("button span:has-text('expand_more')")
        if expand_btn.is_visible():
            expand_btn.click()
            page.wait_for_timeout(500)

            # Now we should see the general search input
            general_input = page.locator("input[placeholder*='장소 검색']").last

            if general_input.is_visible():
                general_input.fill("Cafe")
                general_input.press("Enter")
                page.wait_for_timeout(1000)
                page.screenshot(path="verification/step2_general_enter.png")
                print("General search test complete")
            else:
                 print("General search input not found")

        browser.close()

if __name__ == "__main__":
    verify_search_inputs()
