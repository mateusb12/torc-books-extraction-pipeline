from celery.result import AsyncResult
from fastapi import APIRouter

from source.core.celery_app import celery
from source.features.extraction.tasks import run_extraction, preview_task

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

@extraction_router.post("/preview")
def extract_preview():
    task = preview_task.delay()
    return {
        "message": "preview extraction queued",
        "task_id": task.id,
    }


@extraction_router.get("/task/{task_id}")
def get_task_status(task_id: str):
    result = AsyncResult(task_id, app=celery)

    response = {
        "task_id": task_id,
        "state": result.state,
    }

    if result.state == "SUCCESS":
        response["result"] = result.get()

    if result.state == "FAILURE":
        response["error"] = str(result.info)

    return response