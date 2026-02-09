# Torc Scraper - Books Extraction Pipeline

A containerized, asynchronous data extraction pipeline that scrapes book information from [books.toscrape.com](https://books.toscrape.com). The system uses 
- **FastAPI** for the trigger
- **Celery** for task orchestration
- **Redis** as a message broker
- **Playwright** for browser automation
- **React frontend** for easy monitoring

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your machine
- [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop)

---

# How to build the project

1. Clone this repository:
   ```bash
   git clone https://github.com/mateusb12/torc-books-extraction-pipeline.git
   cd torc-books-extraction-pipeline
   ```

2. Build the Docker containers:
   ```bash
   docker-compose build
   ```
   This step builds the Python backend (API & Worker) and the React frontend

---

# How to start the services

Start the application in detached mode:
```bash
docker-compose up -d
```

Verify that all containers are running:
```bash
docker-compose ps
```

You should see four services:
- **torc-api**
- **torc-worker**
- **torc-redis**
- **torc-frontend**

---

# How to trigger the extraction task

You can trigger the scraping process using the visual dashboard (recommended) or via the command line.

## Option 1: Via the Frontend Dashboard (Recommended)

![Working Screenshot](/assets/working-example.jpeg)

- Open your browser and navigate to:  
  **http://localhost:5173**

- Click the **"+ New Extraction Task"** button.

- Watch the progress bar update in real-time as pages are scraped.

## Option 2: Via CLI (cURL)

Trigger the extraction:
```bash
curl -X POST http://localhost:8000/api/extraction/extract
```

You will receive a response with a `task_id`.  
You can check the task status via:
```bash
curl http://localhost:8000/api/extraction/task/<task_id>
```

---

# What output is generated and where to find it

When the extraction task completes successfully, the data is saved as a structured JSON file.

## 1. Where to find it

The output file is saved to the **output/** directory in your project root (this folder is volume-mapped from the container).

## 2. File Format

The file is named:

```
extraction_<task_uuid>.json
```

### Example Content

```json
[
  {
    "title": "A Light in the Attic",
    "price": "£51.77",
    "rating": "Three",
    "detail_page_url": "https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html"
  },
  {
    "title": "Tipping the Velvet",
    "price": "£53.74",
    "rating": "One",
    "detail_page_url": "https://books.toscrape.com/catalogue/tipping-the-velvet_999/index.html"
  }
]
```

## 3. Data Extracted

Each record contains:

- **title** — The title of the book  
- **price** — The price string (e.g., `"£51.77"`)  
- **rating** — The star rating (e.g., `"Three"`, `"One"`)  
- **detail_page_url** — The absolute URL to the book's detail page  