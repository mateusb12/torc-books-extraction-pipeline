from typing import List
from source.features.extraction.extractor import extract_first_page_previews, get_page_count, extract_all_pages
from source.features.extraction.schemas import BookPreview


def run_preview_extraction(task_instance=None) -> List[BookPreview]:
    total_count = get_page_count()
    return extract_all_pages(task_instance=task_instance, total_pages=total_count)

def fetch_total_pages() -> int:
    return get_page_count()