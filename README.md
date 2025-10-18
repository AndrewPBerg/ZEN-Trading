<div align="center">
  <img src="frontend/public/zen_traders.svg" alt="ZEN Traders Logo" width="200" height="200">
</div>

# ZEN Trading - Astrology-Based Stock Trading Platform

A full-stack web application that combines stock trading with astrological insights, featuring real-time market data, personalized horoscopes, and zodiac-based stock recommendations.

## 🌟 Features

- **Real-time Stock Data**: Live market prices and historical data via yfinance
- **Astrological Integration**: Daily horoscopes and zodiac-based stock matching
- **Portfolio Management**: Buy/sell stocks with portfolio tracking
- **User Authentication**: JWT-based auth with Django REST Framework
- **Responsive UI**: Modern Next.js frontend with Tailwind CSS
- **Background Processing**: Automated price updates and horoscope generation

## 👥 Team

> **Group #3**
- Andrew Berg (Frontend, Full-stack)
- Dalton Boone (Backend, API)
- Jason Bluhm (QA, Docs)
- Devon Traynham (QA, Docs)

---

## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose** (for containerized setup)
- **Node.js 18+** (for local frontend development)
- **Python 3.13+** (for local backend development)
- **PostgreSQL 16+** (for local database)
- **UV Package Manager** ([Installation Guide](https://docs.astral.sh/uv/getting-started/installation/))

---

## 🐳 Docker Setup (Recommended)

### Full Stack with Database

```bash
# Start all services (backend, frontend, database)
docker compose up

# Or start specific services
docker compose up frontend backend pgsql

# Run in background
docker compose up -d
```

### Access Points
- **Frontend**: http://localhost:6969
- **Backend API**: http://localhost:42069
- **Database**: localhost:5432
- **Health Check**: http://localhost:42069/health/

### Docker Services

| Service | Port | Description |
|---------|------|-------------|
| `frontend` | 6969 | Next.js React application |
| `backend` | 42069 | Django REST API server |
| `pgsql` | 5432 | PostgreSQL database |
| `testing` | 42061 | Test automation service |

---

## 💻 Local Development Setup

### Backend Setup (Django + PostgreSQL)

#### 1. Environment Configuration

Create a `.env` file in the project root:

```bash
# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_DB=zentrading
POSTGRES_USER=zenuser
POSTGRES_PASSWORD=zenpass
POSTGRES_PORT=5432

# Django Configuration
SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=1
CLEAR_DB=false

# Optional: Google AI API for horoscope generation
GOOGLE_AI_API_KEY=your-google-ai-key
```

#### 2. Database Setup

```bash
# Install PostgreSQL locally or use Docker
# Option A: Local PostgreSQL
createdb zentrading

# Option B: Docker PostgreSQL only
docker compose up pgsql -d
```

#### 3. Backend Dependencies & Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies with UV
uv sync

# Run database migrations
uv run manage.py migrate

# Populate initial data
uv run manage.py populate_stocks
uv run manage.py populate_zodiac_matching
uv run manage.py fetch_initial_prices

# Set up scheduled tasks
uv run manage.py setup_price_updates
uv run manage.py setup_horoscope_schedule

# Start background worker (in separate terminal)
uv run manage.py qcluster

# Start Django server
uv run manage.py runserver 0.0.0.0:42069
```

### Frontend Setup (Next.js)

#### 1. Install Dependencies

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install
```

#### 2. Environment Configuration

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:42069
INTERNAL_API_URL=http://localhost:42069
```

#### 3. Start Development Server

```bash
# Start Next.js development server
npm run dev

# Or with custom port
npm run dev -- -p 6969
```

### Database Management

#### Clear Database (Development)

```bash
# Using Django management command
cd backend
uv run manage.py clear_db

# Or using Docker
docker compose exec backend uv run manage.py clear_db
```

#### Database Migrations

```bash
# Create new migrations
cd backend
uv run manage.py makemigrations

# Apply migrations
uv run manage.py migrate

# Reset migrations (if needed)
uv run manage.py migrate --fake-initial
```

---

## 🔧 Development Commands

### Backend Commands

```bash
# Start all backend services
cd backend
uv run startup.py

# Individual services
uv run manage.py runserver 0.0.0.0:42069    # Django server
uv run manage.py qcluster                    # Background worker
uv run manage.py shell                       # Django shell
uv run manage.py collectstatic              # Collect static files

# Data management
uv run manage.py populate_stocks            # Load stock data
uv run manage.py fetch_initial_prices       # Get current prices
uv run manage.py generate_horoscopes        # Generate daily horoscopes
```

### Frontend Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Custom ports
npm run dev -- -p 3000    # Custom port
```

### Docker Commands

```bash
# Service management
docker compose up                    # Start all services
docker compose up -d                 # Start in background
docker compose down                  # Stop all services
docker compose restart backend       # Restart specific service

# Logs and debugging
docker compose logs backend          # View backend logs
docker compose logs -f frontend      # Follow frontend logs
docker compose exec backend bash     # Access backend container

# Database operations
docker compose exec pgsql psql -U zenuser -d zentrading  # Access database
```

---

## 🧪 Testing

### API Testing

Common authentication endpoints:

```bash
# Register new user
POST http://localhost:42069/api/register/
{
  "username": "testuser",
  "email": "test@example.com",
  "password1": "securepassword123",
  "password2": "securepassword123"
}

# Login
POST http://localhost:42069/api/auth/token/
{
  "username": "testuser",
  "password": "securepassword123"
}

# Get user profile
GET http://localhost:42069/api/users/me/
Authorization: Bearer <your-jwt-token>
```

### Test Automation

```bash
# Run test suite
cd testing
node test-auth.js                    # Authentication tests
node test-complete-flow.js          # End-to-end tests
node test-portfolio.js              # Portfolio tests
node test-horoscope-api.js          # Horoscope API tests
```

---

## 📊 API Endpoints

### Authentication
- `POST /api/register/` - User registration
- `POST /api/auth/token/` - Login (get JWT)
- `POST /api/auth/token/refresh/` - Refresh JWT
- `GET /api/users/me/` - Current user profile

### Stocks & Market Data
- `GET /api/stocks/` - List all stocks
- `GET /api/stocks/{ticker}/` - Stock details
- `GET /api/stocks/{ticker}/history/` - Stock price history
- `GET /api/market/status/` - Market open/closed status

### Portfolio & Holdings
- `GET /api/portfolio/` - Portfolio summary
- `GET /api/portfolio/history/` - Portfolio value history
- `GET /api/holdings/` - User stock holdings
- `POST /api/holdings/` - Buy/sell stocks

### Astrology Features
- `GET /api/horoscope/` - Daily horoscope
- `GET /api/zodiac/matched-stocks/` - Zodiac-based stock recommendations
- `GET /api/zodiac/matching-rules/` - Zodiac matching rules

### User Preferences
- `GET /api/watchlist/` - User watchlist
- `POST /api/watchlist/` - Add to watchlist
- `GET /api/dislike-list/` - User dislike list

---

## 🛠️ Troubleshooting

### Common Issues

**Backend won't start:**
```bash
# Check database connection
docker compose exec pgsql pg_isready -U zenuser -d zentrading

# Check logs
docker compose logs backend

# Reset database
docker compose down -v
docker compose up pgsql -d
```

**Frontend build errors:**
```bash
# Clear Next.js cache
rm -rf frontend/.next
npm run build

# Check Node.js version
node --version  # Should be 18+
```

**Database connection issues:**
```bash
# Verify PostgreSQL is running
docker compose ps pgsql

# Check database exists
docker compose exec pgsql psql -U zenuser -l
```

### Performance Optimization

- **Backend**: Increase Gunicorn workers in `startup.py`
- **Frontend**: Enable Next.js production optimizations
- **Database**: Add indexes for frequently queried fields
- **Caching**: Implement Redis for session storage

---

## 📝 Development Notes

- **Database**: Uses PostgreSQL with Django ORM
- **Authentication**: JWT tokens with 30-minute expiry
- **Background Tasks**: Django-Q2 for price updates and horoscopes
- **API**: RESTful design with Django REST Framework
- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Deployment**: Docker containerization with health checks

---

## 🔗 Useful Links

- [Django Documentation](https://docs.djangoproject.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [UV Package Manager](https://docs.astral.sh/uv/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
