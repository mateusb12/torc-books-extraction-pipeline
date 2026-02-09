import os
from celery import Celery
from dotenv import load_dotenv

load_dotenv()

BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0")
RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", "redis://redis:6379/1")

celery = Celery(
    "torc",
    broker=BROKER_URL,
    backend=RESULT_BACKEND,
)

celery.autodiscover_tasks([
    "source.features.extraction"
])

import source.features.extraction.tasks
