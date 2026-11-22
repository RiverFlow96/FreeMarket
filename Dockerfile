# Stage 1: Builder
FROM python:3.12-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --upgrade pip
RUN pip wheel -r requirements.txt --no-cache-dir --wheel-dir /wheelhouse

# Copy backend code
COPY backend/ /app/backend

# --- Final Production Image ---
FROM python:3.12-slim AS final

WORKDIR /app/backend

# Install dependencies from wheelhouse
COPY --from=builder /wheelhouse /wheelhouse
RUN pip install --no-cache-dir /wheelhouse/*

# Copy application code
COPY backend/ /app/backend

# Create static and media directories
RUN mkdir -p /app/media /app/staticfiles

# Expose port
EXPOSE 8000

# Start with Gunicorn
CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py seed_categories && exec gunicorn --bind 0.0.0.0:${PORT:-8000} config.wsgi:application"]
