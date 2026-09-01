# JanConnect AI - Backend Design Document

## Architecture Overview

### Layer Architecture
```
┌─────────────────────────────────────┐
│         FastAPI Routes              │
│  (complaints, dashboard, wards)     │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│       Pydantic Schemas              │
│     (Request/Response DTOs)         │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Business Services              │
│  (NLP Service, Priority Engine)     │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      SQLAlchemy Models              │
│       (Ward, Complaint)             │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      PostgreSQL Database            │
└─────────────────────────────────────┘
```

## Database Schema

### Ward Table
```sql
CREATE TABLE wards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    infra_index INTEGER NOT NULL CHECK (infra_index >= 0 AND infra_index <= 100),
    budget_index INTEGER NOT NULL CHECK (budget_index >= 0 AND budget_index <= 100)
);
```

**Seeded Data:**
| name          | infra_index | budget_index |
|---------------|-------------|--------------|
| Rajwada       | 35          | 30           |
| Vijay Nagar   | 80          | 75           |
| Bhawarkuan    | 55          | 50           |
| Palasia       | 60          | 55           |
| Rau           | 25          | 20           |
| Sudama Nagar  | 50          | 45           |

### Complaint Table
```sql
CREATE TABLE complaints (
    id SERIAL PRIMARY KEY,
    tracking_id VARCHAR(20) UNIQUE NOT NULL,
    ward_id INTEGER NOT NULL REFERENCES wards(id),
    raw_text TEXT NOT NULL,
    language VARCHAR(50) DEFAULT 'Hindi + English',
    channel VARCHAR(20) DEFAULT 'text' CHECK (channel IN ('text', 'voice', 'whatsapp')),
    category VARCHAR(50) NOT NULL,
    confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
    urgency INTEGER NOT NULL CHECK (urgency >= 0 AND urgency <= 100),
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'resolved')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_complaints_ward_id ON complaints(ward_id);
CREATE INDEX idx_complaints_tracking_id ON complaints(tracking_id);
CREATE INDEX idx_complaints_category ON complaints(category);
CREATE INDEX idx_complaints_created_at ON complaints(created_at DESC);
```

## API Design

### Base URL
Development: `http://localhost:8000`

### Endpoints

#### Health Check
- **GET /** → `{"status": "ok", "service": "JanConnect AI Backend"}`

#### Complaints
- **POST /api/complaints** - Submit new complaint
- **GET /api/complaints** - List complaints (with filters)
- **GET /api/complaints/{tracking_id}** - Get complaint by tracking ID

#### Dashboard
- **GET /api/dashboard/summary** - Overall statistics
- **GET /api/dashboard/priorities** - Ward priority ranking
- **GET /api/dashboard/categories** - Category distribution
- **POST /api/dashboard/reset-demo** - Reset to demo data

#### Wards
- **GET /api/wards** - List all wards

## Business Logic

### NLP Service Classification Algorithm

#### Category Detection
```python
# Keyword matching (case-insensitive, substring match)
# Category with most keyword matches wins
# Default: "General / Other" if no matches

CATEGORY_KEYWORDS = {
    "Water Supply": ["water", "paani", "pani", "supply", "tanker", "pipeline", "peene"],
    "Road": ["road", "sadak", "gaddha", "pothole", "street", "traffic", "gadde"],
    "Health": ["health", "hospital", "clinic", "doctor", "bimari", "beemar", "ambulance", "dawai"],
    "Electricity": ["electricity", "bijli", "light", "transformer", "power", "current"],
    "Education": ["school", "shiksha", "teacher", "padhai", "college", "admission"],
    "Sanitation": ["garbage", "kachra", "safai", "sewage", "drain", "gutter", "toilet", "gandagi"],
}
```

#### Confidence Calculation
```python
confidence = min(97, 60 + keyword_matches * 14)
```

#### Urgency Calculation
```python
URGENCY_WORDS = ["urgent", "emergency", "bahut", "kaafi", "din se", "hafto se", 
                 "weeks", "months", "bachche", "children", "zaroori", "turant", 
                 "problem", "pareshani"]

urgency = min(96, max(30, 38 + urgency_word_hits * 13 + (12 if category == "Health" else 0)))
```

### Priority Engine Algorithm

For each ward, calculate:

```python
# Demand score (normalized complaint count)
demand_score = (complaint_count_for_ward / max_complaint_count_across_all_wards) * 100

# Infrastructure gap (inverse of existing infrastructure quality)
infra_gap = 100 - ward.infra_index

# Budget gap (inverse of existing budget allocation)
budget_gap = 100 - ward.budget_index

# Weighted priority score
priority_score = round(
    demand_score * 0.45 +
    infra_gap * 0.30 +
    budget_gap * 0.25
)
```

**Weights Rationale:**
- Demand (45%): Citizen voice is most important
- Infrastructure gap (30%): Areas with poor infrastructure need more investment
- Budget gap (25%): Ensure equitable distribution

**Edge Cases:**
- If no complaints exist, treat max_complaint_count as 1 to avoid division by zero
- Sort wards by priority_score descending

## Technology Stack

### Core Framework
- **FastAPI**: High-performance async web framework
- **Uvicorn**: ASGI server for production deployment

### Database Layer
- **PostgreSQL**: Production database (Supabase compatible)
- **SQLAlchemy 2.0**: Modern ORM with async support
- **asyncpg**: High-performance PostgreSQL driver
- **Alembic**: Database migration management

### Validation & Serialization
- **Pydantic v2**: Request/response validation and serialization

### Configuration
- **python-dotenv**: Environment variable management

### Testing
- **pytest**: Testing framework
- **SQLite**: In-memory test database

### Development
- **CORS middleware**: Cross-origin support for frontend development

## Project Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI app initialization, startup events
│   ├── database.py             # Database connection, session management
│   ├── config.py               # Configuration from environment variables
│   ├── models/
│   │   ├── __init__.py
│   │   ├── complaint.py        # Complaint ORM model
│   │   └── ward.py             # Ward ORM model
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── complaint.py        # Complaint Pydantic schemas
│   │   └── dashboard.py        # Dashboard response schemas
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── complaints.py       # Complaint endpoints
│   │   ├── dashboard.py        # Dashboard endpoints
│   │   └── wards.py            # Ward endpoints
│   ├── services/
│   │   ├── __init__.py
│   │   ├── nlp_service.py      # Classification logic
│   │   └── priority_engine.py  # Priority calculation
│   └── seed_data.py            # Initial data seeding
├── tests/
│   ├── __init__.py
│   ├── conftest.py             # Pytest fixtures
│   └── test_*.py               # Test files
├── alembic/
│   ├── versions/               # Migration files
│   ├── env.py                  # Alembic environment
│   └── script.py.mako          # Migration template
├── alembic.ini                 # Alembic configuration
├── requirements.txt            # Python dependencies
├── .env.example                # Example environment variables
├── Dockerfile                  # Container definition
└── README.md                   # Setup and usage instructions
```

## Configuration

### Environment Variables (.env)
```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/janconnect

# API Keys (for future AI integration)
NVIDIA_API_KEY=your_nvidia_nim_api_key_here

# Application
ENVIRONMENT=development
DEBUG=true
```

## Future Enhancements

### AI Integration
- Replace keyword matching with NVIDIA NIM API calls
- Support for Bhashini multilingual translation
- Voice-to-text transcription integration
- WhatsApp bot integration

### Features
- User authentication for policymakers
- Email/SMS notifications on status updates
- Geolocation mapping
- Photo attachment support
- Complaint assignment workflow
- SLA tracking
- Historical trend analysis

### Performance
- Redis caching for dashboard queries
- Background job queue for heavy processing
- Rate limiting
- Database connection pooling optimization

### DevOps
- CI/CD pipeline
- Monitoring and logging (Sentry, DataDog)
- Load balancing
- Auto-scaling configuration
