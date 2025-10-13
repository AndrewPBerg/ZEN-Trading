# python dockerfile for backend

#Uses as base
FROM python:3.13-slim

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

#Goes to the app directory
WORKDIR /app

#Copy the application files
COPY . .

#Install dependencies
RUN pip install uv
RUN uv sync

# Change to backend directory
WORKDIR /app/backend

# Make startup script executable
RUN chmod +x startup.py

#Set port environment variable
ENV PORT=42069

#Expose the port
EXPOSE 42069

# Default command/ overriden by docker compose
# CMD ["sh", "-c", "uv run manage.py runserver 0.0.0.0:$PORT"]

