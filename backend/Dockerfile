# python dockerfile for backend

#Uses as base
FROM python:3.13-slim

# Install system dependencies for Playwright and curl for health checks
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libx11-6 \
    libxcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libxshmfence1 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

#Goes to the app directory
WORKDIR /app

#Copy the application files
COPY . .

#Install dependencies
RUN pip install uv
RUN uv sync

# Install Playwright browsers (chromium only to save space)
RUN uv run playwright install chromium

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

