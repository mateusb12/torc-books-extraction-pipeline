# source/app.py

from fastapi import FastAPI
from source.api.routes_extraction import extraction_router

app = FastAPI(
    title="Books Extraction Pipeline",
    version="0.1.0",
)

@app.get("/health", status_code=200)
def health_check():
    """
    Returns 200 OK if the server is running
    """
    return {"status": "healthy"}

app.include_router(extraction_router, prefix="/api/extraction")