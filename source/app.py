# source/app.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from source.api.routes_extraction import extraction_router

app = FastAPI(
    title="Books Extraction Pipeline",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev only. In prod, specify the exact domain.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", status_code=200)
def health_check():
    """
    Returns 200 OK if the server is running
    """
    return {"status": "healthy"}

app.include_router(extraction_router, prefix="/api/extraction")