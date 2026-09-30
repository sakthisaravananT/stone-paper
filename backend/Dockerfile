FROM python:3.10-slim

WORKDIR /app

# Prevent Python from writing .pyc and buffer stdout
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Run uvicorn on port 8000 (bind to 0.0.0.0 for container accessibility)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
