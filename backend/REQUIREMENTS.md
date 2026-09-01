# JanConnect AI - Backend Requirements

## Overview
JanConnect AI is a Digital Public Good platform that collects citizen development complaints through multiple channels (voice, text, WhatsApp), classifies them using AI, and provides policymakers with investment priority insights.

## Functional Requirements

### Data Collection
- Accept complaints via text, voice transcription, and WhatsApp
- Support multilingual input (Hindi + English mix)
- Auto-generate unique tracking IDs (format: JC-XXXXX)
- Associate complaints with administrative wards

### AI Classification
- Automatically categorize complaints into 7 categories:
  - Water Supply
  - Road
  - Health
  - Electricity
  - Education
  - Sanitation
  - General / Other
- Calculate confidence score (0-100)
- Calculate urgency score (0-100)
- Initial implementation: rule-based keyword matching
- Future: integration-ready for NVIDIA NIM API / Bhashini

### Priority Calculation
- Calculate ward-level priority scores based on:
  - Demand (complaint volume): 45% weight
  - Infrastructure gap: 30% weight
  - Budget gap: 25% weight
- Provide ranked list for policymakers

### Citizen Features
- Track complaint status using tracking ID
- Support complaint lifecycle: submitted → under_review → approved → resolved

### Dashboard Analytics
- Total complaints count
- Wards covered count
- High urgency complaints (urgency >= 70)
- Top complaint category
- Category-wise distribution
- Ward-wise priority ranking

### Demo Support
- Pre-seeded ward data (6 wards: Rajwada, Vijay Nagar, Bhawarkuan, Palasia, Rau, Sudama Nagar)
- Sample complaints (10) for demo purposes
- Reset capability for hackathon/demo scenarios

## Non-Functional Requirements

### Performance
- List/summary endpoints: <200ms response time
- Efficient SQL aggregation over Python loops

### Data Quality
- Validate ward existence before complaint submission
- Proper error messages (404 for invalid ward)
- Data validation using Pydantic v2

### Developer Experience
- Auto-generated API documentation at /docs (Swagger)
- Clear docstrings for all endpoints
- Comprehensive README with setup instructions

### Deployment
- Production-ready structure
- Environment-based configuration
- Supabase PostgreSQL compatible
- Docker support

### Security
- No hardcoded credentials
- Environment variable based configuration
- CORS enabled (development mode)

## Technical Constraints
- Python 3.11+
- FastAPI framework
- PostgreSQL with asyncpg driver
- SQLAlchemy 2.0 ORM
- Alembic migrations
- Pydantic v2 validation
- pytest for testing
