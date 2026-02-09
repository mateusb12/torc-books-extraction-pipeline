from source.core.celery_app import celery

@celery.task(name="features.extraction.run_extraction")
def run_extraction():
    # For now this is just a dummy async task.
    # Later this will call the real extraction logic.
    return {"status": "extraction task completed (dummy)"}
