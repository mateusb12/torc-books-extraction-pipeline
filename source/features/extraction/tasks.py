import json
import os

from source.core.celery_app import celery
from source.features.extraction.service import run_preview_extraction

OUTPUT_DIR = "/app/output"
os.makedirs(OUTPUT_DIR, exist_ok=True)


@celery.task(name="features.extraction.preview", bind=True)
def preview_task(self):
    try:
        data = run_preview_extraction(task_instance=self)
    except Exception as e:
        print(f"ERROR: {repr(e)}")
        raise

    result_list = [item.model_dump(mode="json") for item in data]

    filename = f"extraction_{self.request.id}.json"
    filepath = os.path.join(OUTPUT_DIR, filename)

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(result_list, f, indent=2, ensure_ascii=False)

    print(f"=== SAVED OUTPUT TO: {filepath} ===")

    return {
        "output_file": filepath,
        "data_count": len(result_list),
        "data": result_list
    }
