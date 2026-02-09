Overview
This challenge is designed to assess your ability to investigate, design, and implement a small but realistic data‑extraction system. The focus is not only on whether the solution works, but also on how you approach the problem, what trade‑offs you consider, and how clearly you communicate your reasoning.



This is not a traditional software‑engineering exercise with a single correct implementation. It reflects the kind of work done in reverse‑engineering and automation roles, where discovery, experimentation, and justification matter as much as code quality.

You are encouraged to make reasonable assumptions, explore alternatives, and explain your decisions.



Problem Statement
Build a containerized, asynchronous data‑extraction pipeline that:

Extracts structured data from a public website (https://books.toscrape.com)
Runs the extraction process asynchronously via a task queue
Produces a structured JSON output
Can be built and run locally using Docker
The system should demonstrate:

Task orchestration
External process execution or browser automation
Robustness (basic error handling / retries)
Clear documentation and reasoning


Functional Requirements
Your system must:

Trigger an asynchronous background task that performs the extraction
Extract real data from a public website (no mock data)
Output the extracted data as a JSON file
Be fully runnable using Docker / Docker Compose
Your system may:

Use browser automation (e.g. Playwright, Puppeteer, Selenium)
Use HTTP requests or reverse‑engineered APIs if available
Use any reasonable data extraction strategy
If you choose an alternative approach (e.g. API usage instead of DOM scraping), that is completely valid — but you must explain how and why you chose it.



Technical Constraints
You are expected to use:

Python (for orchestration/backend logic)
Celery (for asynchronous task execution)
Redis (as message broker and/or result backend)
Docker & Docker Compose
For the extraction layer, you may choose:

JavaScript‑based browser automation (e.g. Playwright)
Python‑based browser automation
Direct HTTP / API‑based extraction
You are free to introduce additional libraries or tools if you believe they improve the solution.



Project Structure Expectations
Your repository should include (at a minimum):

A docker-compose.yml
A Dockerfile (or DevContainer configuration)
Python source code
Extraction logic (browser automation, API calls, etc.)
A clear entry point to enqueue or trigger the task
A README.md
You may organize files and folders however you see fit.



Documentation Requirements
Your repository must include documentation covering:



1. Setup & Execution

In README.md:

How to build the project
How to start the services
How to trigger the extraction task
What output is generated and where to find it
Assume the reviewer is running this for the first time.



2. Design & Reasoning (Required)

Create a document (e.g., DESIGN.md, THOUGHTS.md, or similar) that explains:

How you approached the problem
What you investigated before implementing
Why did you choose your extraction strategy
What alternativesdid you considered
Any trade‑offs you made
This document is mandatory and is weighted heavily in the evaluation.

We are explicitly interested in:

Your investigative process
Your assumptions
Your decision‑making rationale
There is no minimum or maximum length — clarity matters more than volume.



Submission Instructions
Create a public GitHub repository
Commit all source code and documentation
Ensure the project runs using Docker
Provide a link to the repository