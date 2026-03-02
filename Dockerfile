FROM python:3.12-slim

WORKDIR /app

# System dependencies for Postgres
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*

# Copy requirements from backend folder
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all backend code into the container
COPY backend/ .

EXPOSE 8000

# This command will be overridden by your Koyeb setting anyway, 
# but we keep a safe default here.
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
