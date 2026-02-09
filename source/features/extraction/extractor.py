import re

from playwright.sync_api import sync_playwright
from urllib.parse import urljoin
from source.features.extraction.schemas import BookPreview

BASE_URL = "https://books.toscrape.com/"

def extract_first_page_previews():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(BASE_URL, timeout=60000)

        items = page.locator("article.product_pod")
        previews = []

        count = items.count()
        for i in range(count):
            item = items.nth(i)

            title = item.locator("h3 a").get_attribute("title")
            price = item.locator(".price_color").inner_text()
            rating_class = item.locator(".star-rating").get_attribute("class")
            rating = rating_class.replace("star-rating", "").strip()

            raw_link = item.locator("h3 a").get_attribute("href")
            detail_link = urljoin(BASE_URL, raw_link)

            previews.append(
                BookPreview(
                    title=title,
                    price=price,
                    rating=rating,
                    detail_page_url=detail_link,
                )
            )

        browser.close()
        return previews


def get_page_count():
    """
    Scrapes the total number of pages from the pagination element
    """
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(BASE_URL, timeout=60000)

        pager_text = page.locator("ul.pager li.current").inner_text().strip()

        match = re.search(r"of (\d+)", pager_text)
        total_pages = int(match.group(1)) if match else 1

        browser.close()
        return total_pages