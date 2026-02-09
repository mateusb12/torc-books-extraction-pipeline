from typing import List
from source.features.extraction.extractor import extract_first_page_previews, get_page_count
from source.features.extraction.schemas import BookPreview


def run_preview_extraction() -> List[BookPreview]:
    """
    High-level orchestration for the hello-world extraction.
    Later this will expand into full pagination + detail scraping
    """
    return extract_first_page_previews()

def fetch_total_pages() -> int:
    return get_page_count()