# Dockerfile — for ECS Fargate / ECR
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# system deps
RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

COPY . .

# create data dir for local adapter
RUN mkdir -p /app/data

EXPOSE 5000

# Gunicorn expects a callable named "app" or "application" — our create_app returns Flask app
CMD ["gunicorn", "main:create_app()", "--bind", "0.0.0.0:5000", "--workers", "3", "--threads", "8"]
