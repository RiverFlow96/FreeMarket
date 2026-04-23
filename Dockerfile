# Use a multi-stage build for efficiency and security
FROM python:3.11-slim as builder

# Set environment variables to prevent Python from writing .pyc files
# and ensure output is immediately available in the container.
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install dependencies first to leverage Docker caching
# We assume requirements.txt exists for production dependencies (e.g., gunicorn, psycopg2-binary)
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip wheel -r requirements.txt --no-cache-dir

# Copy the rest of the application code
COPY backend/ /app/backend
COPY manage.py .

# Run migrations and collect static files in the build stage (optional, but good practice)
# NOTE: In a real CI/CD pipeline, you might run these steps before building the image
# or mount volumes if running locally for testing.
RUN pip install gunicorn # Ensure gunicorn is available for this step if not in requirements.txt
RUN python manage.py makemigrations --noinput
RUN python manage.py migrate

# --- Final Production Image ---
FROM python:3.11-slim as final

WORKDIR /app

# Copy only the necessary virtual environment dependencies from the builder stage
COPY --from=builder /usr/local/lib/python3.11/site-packages/ /usr/local/lib/python3.11/site-packages/
# Copy compiled static files and application code
COPY --from=builder /app/backend /app/backend
COPY --from=builder /app/manage.py .

# Expose the port Gunicorn will listen on (standard is 8000)
EXPOSE 8000

# Set the command to run the application using Gunicorn
# Adjust 'your_project_name' to match your actual Django project name found in settings.py
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "backend.wsgi:application"]

# Commands for local run:
# docker build -t mi-ecommerce-api .
# docker run -d -p 8000:8000 --name ecommerce_container mi-ecommerce-api
