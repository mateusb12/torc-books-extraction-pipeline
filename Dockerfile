FROM python:3.11-slim

WORKDIR /app
COPY . /app

RUN pip install fastapi uvicorn celery redis playwright beautifulsoup4 lxml

CMD ["uvicorn", "source.main:app", "--host", "0.0.0.0", "--port", "8000"]