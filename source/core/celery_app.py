import os
from celery import Celery

# Environment variables with sane defaults for Docker
BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0")
RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", "redis://redis:6379/1")

celery = Celery(
    "torc",
    broker=BROKER_URL,
    backend=RESULT_BACKEND,
)

# Optional: configuration can go here later (task_routes, timeouts, etc.)
