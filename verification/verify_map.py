
import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        try:
            await page.goto("http://localhost:5173/")
            print("Navigated to http://localhost:5173/")
        except Exception as e:
            print(f"Failed to navigate: {e}")
            await browser.close()
            return

        try:
            # Wait for the header to appear
            print("Waiting for header...")
            await page.wait_for_selector("header", timeout=10000)
            print("Header found.")

            # Take initial screenshot
            await page.screenshot(path="verification/step1_map_view.png")

            # Check for the expand button
            expand_btn = page.locator("button:has(span.material-symbols-outlined:text('expand_more'))")
            if await expand_btn.count() > 0:
                print("Expand button found. Clicking...")
                await expand_btn.click()

                # Wait for the second search bar
                # Correct placeholder: "주소 또는 장소 검색..."
                print("Waiting for second search bar...")
                search_input = page.locator("input[placeholder='주소 또는 장소 검색...']")
                await search_input.wait_for(state="visible", timeout=5000)
                print("Second search bar visible.")

                await page.screenshot(path="verification/step2_search_expanded.png")
            else:
                print("Expand button not found.")
                collapse_btn = page.locator("button:has(span.material-symbols-outlined:text('expand_less'))")
                if await collapse_btn.count() > 0:
                     print("Expand button was 'expand_less', meaning it's already expanded.")
                     await page.screenshot(path="verification/step2_search_expanded_already.png")
                else:
                    print("Neither expand_more nor expand_less button found.")
                    print(await page.content())

        except Exception as e:
            print(f"Error during verification: {e}")
            await page.screenshot(path="verification/error_state.png")

        await browser.close()

asyncio.run(run())
