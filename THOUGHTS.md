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
- **Broker/State Layer:** Redis acting as both the message broker for Celery and a persistent store for task history
- **Error Handling Layer:** Managing retries and failure states
- **Output Layer:** Structured JSON responses for data consumption

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
- Visualizes the "Pending" vs "Success" states automatically
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
Here is the Minimum Viable Dataset (MVD) I decided to extract for each book:

### From listing pages
- Title
- Price
- Rating
- Detail page URL

### From details page
- Description
- UPC
- Availability
- Image URL
- Category

### Final MVD Json
```json
{
  "title": "...",
  "price": "...",
  "rating": "...",
  "detail_page_url": "...",
  "description": "...",
  "upc": "...",
  "availability": "...",
  "image_url": "...",
  "category": "..."
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
- Performance vs realism
- Docker image size increase
- Frontend complexity vs usability