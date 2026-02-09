# How you approached the problem?
So basically the project involves several high-level steps from my end

## System Architecture Diagram

![System Architecture](/assets/diagram.jpeg)

## 1. Data extraction
### 1. Analyze and explore how the data from https://books.toscrape.com works
### 2. Search for any anti-scraping or rate-limiting measures
### 3. Implement a data extraction strategy (e.g. browser automation, API calls, etc.)
### 4. Test and validate the extraction logic
### 5. Check for any edge cases or potential issues (e.g. handling pagination, dynamic content, etc.)

## 2. Requirements and technical constraints
### 1. Project must use: python, celery, redis, docker, docker compose
### 2. For extraction layer, I can choose:
- JavaScript-based browser automation
- Python-based browser automation
- Direct HTTP / API-based extraction
### 3. Decide on minimum viable scope
- Which fields to extract from each book (eg. title, price, availability, etc.)
- Whether to scrape all pages or just a subset
- What 'good enough' means for error handling, retries, etc.

## 3. System Design Architecture
The system consists of 7 fundamental layers:
- **Presentation Layer (Frontend):** A React/Vite dashboard to trigger tasks and visualize results in real-time
- **Trigger Layer (API):** FastAPI endpoints responsible for initiating the extraction process
- **Orchestration Layer:** Celery managing the asynchronous task queue
- **Data Extraction Layer:** Playwright browser automation interacting with the target website
- **Broker/State Layer:** Redis acts as a message broker, stores task history, and keeps temporary progress data
- **Error Handling Layer:** Managing retries and failure states
- **Output Layer:** Structured JSON responses for API consumption and physical JSON file persistence (to /output) for review

## 4. Local MVP validation
Before transitioning towards docker, I validated the entire pipeline to ensure the architecture was correct. This included:
- FastAPI endpoint to trigger Celery tasks
- Celery workers consuming tasks via Redis
- Playwright browser automation extracting real data
- Pydantic schema validation + JSON serialization
- Task status retrieval `/task/{task_id}`

With this baseline validated, the next step was containerizing the system and improving the user experience.

# Evolution of the Solution: Why a Frontend?
Initially, I relied on `curl` commands to interact with the API. However, I identified a significant usability friction with the asynchronous nature of the system:
1. Triggering a task returned a `task_id`.
2. I had to manually copy this ID and repeatedly run `curl` to poll for status.
3. I had no easy way to see a history of previous runs.

To address this, I implemented a lightweight **React + Vite** frontend. This serves as a control plane that:
- Eliminates manual polling (the UI handles the event loop)
- Fixes the UX problem with long tasks: scraping many pages is slow and tedious, and without updates users may assume the task is stuck. I used Celery’s update_state to send progress, allowing the frontend to show a real-time bar (Page X of Y).
- **Dynamic Introspection:** Allows fetching the total number of pages (pagination) on-demand to gauge the scope before scraping.
- Persists a history of recent tasks using Redis Lists, ensuring context isn't lost on page refresh

# What you investigated before implementing
The investigation consisted of 4 main areas:
- Website structure and behavior
- Comparison of extracting approaches
- Asynchronous task management
- Error handling main challenges

## Exploratory analysis of books.toscrape.com
Before writing any code, I opened `https://books.toscrape.com` in the browser and investigated what data is considered useful.

### Main page
- Book categories listing on the left sidebar
- Product pagination results in the main content area
- Each book has a cover picture, a review star rating, a title, a price and availability status

### Book details
Each book has a details page with more information such as:
- Title
- Price
- How many books are available in stock
- Product description
- Product information (UPC, product type, price excluding tax, price including tax, tax, availability, number of reviews)

## Choosing which data to extract
For this MVP, I decided to focus on the **Listing Page Strategy**

While the website offers a detailed view for every book (UPC, Description, Stock count), visiting the detail page for every single book (1000 items) would significantly increase the execution time and load on the target server.

Therefore, I defined the **Minimum Viable Dataset (MVD)** based on what is available on the **Catalogue / Listing** pages to demonstrate high-performance pagination scraping:

### Extracted Fields (Listing Page)
- Title
- Price
- Rating
- Detail page URL

*Note: The data schemas (`schemas.py`) are designed to support full detail scraping (UPC, Description) in a future v2 iteration.*

### Final MVD Json
```json
{
  "title": "A Light in the Attic",
  "price": "£51.77",
  "rating": "Three",
  "detail_page_url": "https://books.toscrape.com/..."
}
```

# Why did you choose your extraction strategy?
### When should we use Playwright?
- Dynamic content
- Hard-to-reverse engineer endpoints
- Anti-scraping protections
- Need to visually validate selectors

### When should we use direct HTTP requests?
- Static website
- Everything is ready on page load
- URL patterns are straightforward

### My reasoning:
- The challenge explicitly mentions automation
- Browser automation is closer to real-world scraping
- Playwright allows selector validation and is resilient to future changes

# What alternatives did you consider
- Direct HTTP requests + HTML parsing
- Database storage (PostgreSQL)

# Any trade-offs you made
- **Performance vs Realism (Ethical Scraping):**
  I deliberately chose a "Listing-First" strategy (50 requests) over a "Deep-Scrape" strategy (1,050 requests)
    - **Reasoning:** In a real-world scenario, scraping 1,000+ pages requires robust rate-limiting, proxy rotation, and error handling to avoid IP bans, as it may be considered an aggressive attack on the server.
    - **Trade-off:** For this MVP, I prioritized **pipeline latency** and **server respect** over data depth. The schema `BookDetails` is defined in `schemas.py` to show I anticipated the data structure, but I disabled the actual deep-fetch loop to keep the demo lightweight.

- **Docker Image Size:**
  The inclusion of Playwright and its browser binaries increases the image size significantly compared to a simple `requests` based solution.

- **Polling vs. WebSockets for Progress:**
  I chose to implement short-interval HTTP polling (1s) for the progress bar instead of setting up a complex WebSocket connection.
    - **Reasoning:** For a local MVP with a single user, polling is significantly simpler to implement and debug than managing WebSocket lifecycles. The overhead on a local Redis instance is negligible.