import os
import redis
from celery.result import AsyncResult
from fastapi import APIRouter

from source.core.celery_app import celery
from source.features.extraction.service import fetch_total_pages
from source.features.extraction.tasks import preview_task

extraction_router = APIRouter()

REDIS_URL = os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0")
redis_client = redis.from_url(REDIS_URL)


@extraction_router.post("/extract")
def trigger_extraction():
    """
    Triggers the scraper and saves the Task ID to history
    """
    task = preview_task.delay()

    redis_client.lpush("task_history", task.id)
    redis_client.ltrim("task_history", 0, 49)
    # ----------------------------

    return {
        "message": "extraction task queued",
        "task_id": task.id,
    }


@extraction_router.get("/history")
def get_task_history():
    """
    Returns the list of recently triggered task IDs
    """
    raw_ids = redis_client.lrange("task_history", 0, -1)
    task_ids = [t.decode("utf-8") for t in raw_ids]
    return {"history": task_ids}


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

@extraction_router.get("/pages")
def get_total_pages():
    """
    Returns the total number of pages available to scrape
    """
    count = fetch_total_pages()
    return {"total_pages": count}