FROM python:3.12-slim

WORKDIR /app

# System deps (you can expand this later if Playwright needs extra libs)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy only poetry files first for better caching
COPY pyproject.toml poetry.lock /app/

# Install Poetry
RUN pip install --no-cache-dir poetry

# Configure Poetry to install directly into the system env
RUN poetry config virtualenvs.create false

# Install dependencies (no-root: we don't need to install the app as a package)
RUN poetry install --no-root

# Now copy the rest of the source code
COPY . /app

# Default command will be overridden by docker-compose for worker
CMD ["uvicorn", "source.app:app", "--host", "0.0.0.0", "--port", "8000"]
