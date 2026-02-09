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

## 3. System design architecture
The system consist of 6 fundamental layers
- Data Extraction Layer: responsible for extracting data from the target website (e.g. using Playwright)
- Trigger Layer: responsible for initiating the extraction process (e.g. via a REST API endpoint)
- Extraction Layer: responsible for orchestrating the extraction process (e.g. using Celery to manage asynchronous tasks)
- Error Handling Layer: responsible for managing errors and retries (e.g. using Celery's built-in retry mechanism)
- Async Layer: responsible for managing asynchronous execution (e.g. using Celery workers)
- Output Layer: responsible for storing and outputting the extracted data (e.g. saving to a JSON file)

# What you investigated before implementing
The investigation consists of 4 main areas:
- Website structure and behavior
    - Static or dynamic html content?
    - Predictable URL patterns?
    - Consistent HTML structure?
    - Anti-scraping measures? (captcha, dynamic tokens, user-agent restrictions, etc)
- Comparison of extracting approaches
    - Direct HTTP requests and HTML parsing
    - Browser automation (e.g. Playwright, Selenium)
- Asynchronous task management
    - How celery queues and workers operate?
    - How will the services communicate over the same docker network?
    - How can we do a proper separation of concerns between the inner components?
- Error handling main challenges
    - Common failure scenarios (internet disruptions, website temporary unavailable, html structure changes, etc)
    - Celery retry behavior (configuring retry limits, making tasks idempotent, logging failures, etc)
    - Playwright-specific failure modes (slow navigation, missing selector, browser caches)

## Exploratory analysis of books.toscrape.com

Before writing any code, I opened `https://books.toscrape.com` in the browser and investigated what data is considered useful

There is plenty of data here.
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
- UPC (unique product code)
- Availability (number of books in stock)
- Image URL
- Category

### Excluded fields
- price excluding tax
- price including tax
- tax
- number of reviews
- product type

They were intentionally excluded from the MVD because:
- They are not critical for the core functionality of the scraper
- Extracting them would not demonstrate any additional technical challenges

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

# Why did you choose your extraction strategy
- When should we use playwright?
  - Dynamic content
  - Hard-to-reverse engineer endpoints
  - Anti-scraping protections
  - Need to visually validate selectors
- When should we use direct HTTP requests?
  - The website is static
  - Everything is ready on page load
  - URL patterns are simple and straightforward

My reasoning:
- The challenge explicitly mentions "external process execution or browser automation", which suggests Playright is a good candidate for that
- Browser automation is a lot more closer to real-world scraping scenarios where
  - content may become dynamic at some point
  - endpoints may become harder to reverse engineer
  - anti-scraping measures require a more human-like interaction

Also, using playwright allows me to:
- visually validate the selectors during the exploratory phase
- keep the extraction strategy resilient for potential future website changes
- demonstrate proficiency with automating a headless browser end-to-end

PS: At the same time, I still considered a more traditional HTTP-request based scraper as an alternative strategy.

# What alternatives did you consider
- Direct HTTP requests + HTML parsing
- Javascript based browser automation (e.g. Puppeteer)
- Storing data in a database vs writing a flat json file

# Any trade-offs you made
- Performance vs realism
- Simplicity vs flexibility
- Docker image size vs capabilities
