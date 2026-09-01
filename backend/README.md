# JanConnect AI - Backend

Digital Public Good platform for citizen complaint management and policymaker investment insights.

## Features

- **Multi-channel complaint submission**: text, voice transcription, WhatsApp
- **AI-powered classification**: Automatically categorizes complaints into 7 categories
- **Priority scoring**: Helps policymakers identify which wards need urgent investment
- **Citizen tracking**: Track complaint status using tracking ID (format: JC-XXXXX)
- **Dashboard analytics**: Summary statistics, category distribution, ward priorities
- **Production-ready**: PostgreSQL with Supabase compatibility, Docker support

## Tech Stack

- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL with asyncpg driver
- **ORM**: SQLAlchemy 2.0 (async)
- **Validation**: Pydantic v2
- **Migrations**: Alembic
- **Testing**: pytest with async support

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app initialization
│   ├── database.py          # Database connection & session
│   ├── config.py            # Environment configuration
│   ├── models/              # SQLAlchemy ORM models
│   ├── schemas/             # Pydantic request/response schemas
│   ├── routes/              # API endpoint routers
│   ├── services/            # Business logic (NLP, priorities)
│   └── seed_data.py         # Database seeding
├── tests/                   # Pytest test suite
├── alembic/                 # Database migrations
├── requirements.txt         # Python dependencies
├── .env.example             # Environment variable template
├── Dockerfile               # Container definition
└── README.md               # This file
```

## Setup Instructions

### Prerequisites

- Python 3.11 or higher
- PostgreSQL 14+ (or Supabase account)
- pip or uv (Python package manager)

### 1. Clone and Navigate

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Local PostgreSQL
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/janconnect

# OR Supabase PostgreSQL
# DATABASE_URL=postgresql+asyncpg://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Optional: For future AI integration
NVIDIA_API_KEY=your_api_key_here

ENVIRONMENT=development
DEBUG=true
```

### 5. Run Database Migrations

```bash
# Initialize Alembic (if needed)
alembic upgrade head
```

> **Note**: The application will automatically create tables and seed initial data on first startup.

### 6. Start Development Server

```bash
uvicorn app.main:app --reload
```

The server will start at `http://localhost:8000`

### 7. Access API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Database Setup

### Option 1: Local PostgreSQL

1. Install PostgreSQL 14+
2. Create database:
   ```sql
   CREATE DATABASE janconnect;
   ```
3. Update `DATABASE_URL` in `.env`

### Option 2: Supabase (Free Tier)

1. Create account at https://supabase.com
2. Create new project
3. Go to Project Settings → Database
4. Copy connection string (Session pooler mode)
5. Update `DATABASE_URL` in `.env`:
   ```
   postgresql+asyncpg://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

## Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_complaints.py

# Run with verbose output
pytest -v
```

Tests use an in-memory SQLite database for speed and isolation.

## API Endpoints

### Health Check
- `GET /` - Service health status

### Complaints
- `POST /api/complaints` - Submit new complaint
- `GET /api/complaints` - List complaints (with filters)
- `GET /api/complaints/{tracking_id}` - Get complaint by tracking ID

### Dashboard
- `GET /api/dashboard/summary` - Overall statistics
- `GET /api/dashboard/priorities` - Ward priority ranking
- `GET /api/dashboard/categories` - Category distribution
- `POST /api/dashboard/reset-demo` - Reset to demo data

### Wards
- `GET /api/wards` - List all wards

## Seeded Data

### Wards (6 total)
- Rajwada
- Vijay Nagar
- Bhawarkuan
- Palasia
- Rau
- Sudama Nagar

### Demo Complaints (10 total)
Automatically seeded on first startup for testing/demos.

## Docker Deployment

### Build Image

```bash
docker build -t janconnect-backend .
```

### Run Container

```bash
docker run -d \
  -p 8000:8000 \
  -e DATABASE_URL="postgresql+asyncpg://..." \
  --name janconnect-backend \
  janconnect-backend
```

### Docker Compose (with PostgreSQL)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: janconnect
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql+asyncpg://postgres:password@db:5432/janconnect
      ENVIRONMENT: production
      DEBUG: false
    depends_on:
      - db

volumes:
  postgres_data:
```

Run:

```bash
docker-compose up -d
```

## NLP Classification

Currently uses rule-based keyword matching for complaint classification:

### Categories
- Water Supply
- Road
- Health
- Electricity
- Education
- Sanitation
- General / Other

### Future AI Integration

The NLP service is structured for easy integration with NVIDIA NIM API or Bhashini:

1. Set `NVIDIA_API_KEY` in `.env`
2. Uncomment AI implementation in `app/services/nlp_service.py`
3. Replace `classify_complaint()` calls with `classify_complaint_ai()`

See `nlp_service.py` for detailed integration instructions.

## Priority Scoring Algorithm

Ward priority scores are calculated using:

```
demand_score = (ward_complaints / max_complaints) * 100
infra_gap = 100 - infra_index
budget_gap = 100 - budget_index

priority_score = (demand_score × 0.45) + (infra_gap × 0.30) + (budget_gap × 0.25)
```

**Weights:**
- Demand (citizen voice): 45%
- Infrastructure gap: 30%
- Budget gap: 25%

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 8000
# Windows
netstat -ano | findstr :8000

# Mac/Linux
lsof -i :8000

# Kill process and restart
```

### Database Connection Error

- Verify PostgreSQL is running
- Check `DATABASE_URL` format
- Ensure database exists
- Check firewall/network settings for Supabase

### Migration Issues

```bash
# Reset migrations (development only!)
alembic downgrade base
alembic upgrade head
```

### Import Errors

```bash
# Reinstall dependencies
pip install --force-reinstall -r requirements.txt
```

## Performance Notes

- All list/summary endpoints respond in <200ms for the demo dataset
- Indexes on frequently queried columns (ward_id, category, created_at, tracking_id)
- Async database operations for high concurrency
- Connection pooling via SQLAlchemy

## Security Notes

- CORS enabled for all origins (development mode)
- **Production**: Restrict CORS to specific frontend origins
- **Production**: Use environment variables, never commit `.env`
- **Production**: Enable HTTPS/TLS
- **Production**: Add rate limiting (e.g., slowapi)

## Contributing

1. Fork the repository
2. Create feature branch
3. Write tests for new features
4. Ensure all tests pass: `pytest`
5. Submit pull request

## License

MIT License - This is a Digital Public Good

## Support

For issues or questions:
- Check API documentation at `/docs`
- Review test files for usage examples
- Open an issue on GitHub

## Roadmap

- [ ] NVIDIA NIM API integration
- [ ] Bhashini multilingual support
- [ ] Voice-to-text transcription
- [ ] WhatsApp bot integration
- [ ] Email/SMS notifications
- [ ] Geolocation mapping
- [ ] Photo attachments
- [ ] Admin authentication
- [ ] Historical trend analysis
- [ ] Redis caching
