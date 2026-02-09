from fastapi import FastAPI

app = FastAPI(
    title="Books Extraction Pipeline",
    version="0.1.0",
)

@app.get("/hello")
def hello_world():
    return {"message": "Hello world!"}