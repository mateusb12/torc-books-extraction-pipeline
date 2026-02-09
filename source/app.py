from fastapi import FastAPI

from source.api.routes_extraction import extraction_router

app = FastAPI(
    title="Books Extraction Pipeline",
    version="0.1.0",
)

@app.get("/hello")
def hello_world():
    return {"message": "Hello world!"}

app.include_router(extraction_router, prefix="/api/extraction")