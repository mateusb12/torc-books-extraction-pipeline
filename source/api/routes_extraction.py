from fastapi import APIRouter
from source.features.extraction.tasks import run_extraction

extraction_router = APIRouter()

@extraction_router.get("/ping")
def ping():
    return {"status": "ok"}

@extraction_router.post("/extract")
def trigger_extraction():
    task = run_extraction.delay()
    return {
        "message": "extraction task queued",
        "task_id": task.id,
    }