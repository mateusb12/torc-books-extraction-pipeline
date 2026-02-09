from source.core.celery_app import celery
from source.features.extraction.service import run_preview_extraction


@celery.task(name="features.extraction.preview")
def preview_task():
    try:
        data = run_preview_extraction()
    except Exception as e:
        print("ERROR during extraction:")
        print(repr(e))
        raise

    print("=== RAW SCRAPED DATA ===")
    for d in data:
        print(d)
    print("========================")

    try:
        result = [item.model_dump(mode="json") for item in data]
        return result
    except Exception as e:
        print("ERROR during model_dump:")
        print(repr(e))
        raise
