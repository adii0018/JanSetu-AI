# JanConnect AI - Quick Reference Guide

## 🚀 Quick Start Commands

```bash
# Setup
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
cp .env.example .env           # Edit DATABASE_URL
alembic upgrade head

# Run
uvicorn app.main:app --reload

# Test
pytest
pytest --cov=app
```

## 🐳 Docker Quick Start

```bash
cd backend
docker-compose up -d           # Start PostgreSQL + Backend
docker-compose logs -f backend # View logs
docker-compose down            # Stop
```

## 📡 API Endpoints at a Glance

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | Health check |
| POST | `/api/complaints` | Submit complaint |
| GET | `/api/complaints` | List complaints |
| GET | `/api/complaints/{id}` | Get by tracking ID |
| GET | `/api/dashboard/summary` | Stats summary |
| GET | `/api/dashboard/priorities` | Ward priorities |
| GET | `/api/dashboard/categories` | Category counts |
| GET | `/api/wards` | List wards |
| POST | `/api/dashboard/reset-demo` | Reset demo data |

## 📝 Example Requests

### Submit Complaint
```bash
curl -X POST http://localhost:8000/api/complaints \
  -H "Content-Type: application/json" \
  -d '{
    "ward_id": 1,
    "raw_text": "Paani ki supply nahi aa rahi hai",
    "language": "Hindi + English",
    "channel": "text"
  }'
```

### Get Dashboard Summary
```bash
curl http://localhost:8000/api/dashboard/summary
```

### List Wards
```bash
curl http://localhost:8000/api/wards
```

## 🗄️ Database Quick Reference

### Connection Strings

```bash
# Local PostgreSQL
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/janconnect

# Supabase
DATABASE_URL=postgresql+asyncpg://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
```

### Alembic Commands

```bash
# Create migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback one
alembic downgrade -1

# View history
alembic history

# Current version
alembic current
```

## 🧪 Testing Quick Reference

```bash
# Run all tests
pytest

# Run specific file
pytest tests/test_complaints.py

# Run with output
pytest -v -s

# Run with coverage
pytest --cov=app --cov-report=html

# Run single test
pytest tests/test_complaints.py::test_submit_complaint
```

## 🏗️ Project Structure Quick Map

```
app/
├── main.py              ← Start here
├── config.py            ← Environment variables
├── database.py          ← DB connection
├── models/              ← Database tables
├── schemas/             ← Request/response validation
├── routes/              ← API endpoints
├── services/            ← Business logic
└── seed_data.py         ← Initial data
```

## 🔑 Environment Variables

| Variable | Required | Default | Example |
|----------|----------|---------|---------|
| DATABASE_URL | Yes | - | `postgresql+asyncpg://...` |
| NVIDIA_API_KEY | No | None | `nvapi-xxx...` |
| ENVIRONMENT | No | development | `production` |
| DEBUG | No | true | `false` |

## 📊 Data Models Quick View

### Ward
```python
{
  "id": 1,
  "name": "Rajwada",
  "infra_index": 35,    # 0-100
  "budget_index": 30    # 0-100
}
```

### Complaint
```python
{
  "id": 1,
  "tracking_id": "JC-12345",
  "ward_id": 1,
  "raw_text": "Complaint text",
  "language": "Hindi + English",
  "channel": "text",              # text|voice|whatsapp
  "category": "Water Supply",     # 7 categories
  "confidence": 88,               # 0-100
  "urgency": 75,                  # 0-100
  "status": "submitted",          # submitted|under_review|approved|resolved
  "created_at": "2026-09-01T10:30:00Z"
}
```

## 🎯 Categories

1. Water Supply
2. Road
3. Health
4. Electricity
5. Education
6. Sanitation
7. General / Other

## 🏙️ Seeded Wards

| Ward | Infra Index | Budget Index |
|------|-------------|--------------|
| Rajwada | 35 | 30 |
| Vijay Nagar | 80 | 75 |
| Bhawarkuan | 55 | 50 |
| Palasia | 60 | 55 |
| Rau | 25 | 20 |
| Sudama Nagar | 50 | 45 |

## 🧮 Scoring Formulas

### Confidence
```python
confidence = min(97, 60 + keyword_matches * 14)
```

### Urgency
```python
urgency = min(96, max(30, 38 + urgency_hits * 13 + (12 if Health else 0)))
```

### Priority
```python
demand_score = (complaint_count / max_count) * 100
infra_gap = 100 - infra_index
budget_gap = 100 - budget_index
priority = round(demand * 0.45 + infra * 0.30 + budget * 0.25)
```

## 🔍 Common Tasks

### Add New Category
1. Update `CATEGORY_KEYWORDS` in `services/nlp_service.py`
2. No database migration needed

### Add New Ward
1. Create migration: `alembic revision -m "add new ward"`
2. Add INSERT in migration
3. Run: `alembic upgrade head`

### Change Priority Weights
Edit `services/priority_engine.py`:
```python
priority_score = round(
    demand_score * 0.45 +  # Change these
    infra_gap * 0.30 +
    budget_gap * 0.25
)
```

### Add New Status
1. Update `ComplaintStatus` enum in `models/complaint.py`
2. Create migration: `alembic revision --autogenerate -m "add status"`
3. Run: `alembic upgrade head`

## 🐛 Troubleshooting Quick Fixes

### Port 8000 in use
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

### Database connection failed
```bash
# Check PostgreSQL is running
# Windows
sc query postgresql-x64-15

# Verify .env DATABASE_URL is correct
# Test connection
psql -h localhost -U postgres -d janconnect
```

### Import errors
```bash
# Reinstall dependencies
pip install --force-reinstall -r requirements.txt

# Check virtual environment is activated
which python  # Should show venv path
```

### Migration conflicts
```bash
# Reset migrations (DEV ONLY!)
alembic downgrade base
alembic upgrade head
```

### Tests failing
```bash
# Ensure test dependencies installed
pip install pytest pytest-asyncio httpx aiosqlite

# Clear pytest cache
pytest --cache-clear

# Run with verbose output
pytest -v -s
```

## 📚 Documentation Files

- `README.md` - Setup & installation
- `REQUIREMENTS.md` - Functional requirements
- `DESIGN.md` - Architecture & algorithms
- `API_DOCUMENTATION.md` - Complete API reference
- `ARCHITECTURE.md` - System architecture
- `IMPLEMENTATION_SUMMARY.md` - What's implemented
- `QUICK_REFERENCE.md` - This file

## 🌐 Useful Links

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health Check: http://localhost:8000/

## 💡 Tips & Best Practices

### Development
- Use `--reload` flag for auto-restart on code changes
- Check `/docs` for interactive API testing
- Run tests before committing changes
- Use meaningful commit messages

### Database
- Always create migrations for schema changes
- Test migrations with upgrade/downgrade
- Backup production data before migrations
- Use indexes for frequently queried columns

### API Design
- Follow RESTful conventions
- Use proper HTTP status codes
- Validate all inputs with Pydantic
- Return meaningful error messages

### Testing
- Write tests for new features
- Test error cases, not just happy paths
- Use fixtures for repeated setup
- Aim for >80% code coverage

### Performance
- Use async/await consistently
- Leverage database indexes
- Cache expensive queries (future)
- Monitor slow queries

## 🎓 Learning Path

For new developers:

1. **Start Here**: `README.md` → Setup instructions
2. **Understand**: `DESIGN.md` → Architecture overview
3. **Explore**: `app/main.py` → Application entry point
4. **Study**: `app/routes/complaints.py` → API endpoints
5. **Learn**: `tests/test_complaints.py` → Testing patterns
6. **Reference**: `API_DOCUMENTATION.md` → API details

## 🚦 Status Indicators

| Status | Meaning |
|--------|---------|
| ✅ Implemented | Feature complete and tested |
| 🚧 In Progress | Currently being developed |
| 📋 Planned | On roadmap, not started |
| ⚠️ Known Issue | Documented limitation |

## 🔄 Common Workflows

### Feature Development Workflow
```bash
1. git checkout -b feature/new-feature
2. Edit code
3. Write tests
4. pytest
5. git commit -m "Add: feature description"
6. git push
```

### Database Change Workflow
```bash
1. Edit models in app/models/
2. alembic revision --autogenerate -m "description"
3. Review migration in alembic/versions/
4. alembic upgrade head
5. Test with real data
```

### Deployment Workflow
```bash
1. Update .env for production
2. docker build -t janconnect .
3. docker run -d -p 8000:8000 janconnect
4. Verify: curl http://localhost:8000/
5. Check logs: docker logs <container-id>
```

## 📞 Getting Help

1. Check error messages in terminal
2. Review logs in console
3. Check `/docs` for API reference
4. Search documentation files
5. Review test files for examples
6. Check GitHub issues

## ⚡ Performance Benchmarks

Target performance (demo dataset):
- Health check: <10ms
- Submit complaint: <100ms
- List complaints: <50ms
- Dashboard summary: <200ms
- Ward priorities: <200ms

## 🔐 Security Checklist

- [x] Environment variables for secrets
- [x] Input validation (Pydantic)
- [x] SQL injection prevention (ORM)
- [ ] HTTPS/TLS (Production)
- [ ] Rate limiting (Production)
- [ ] Authentication (Production)
- [ ] CORS restrictions (Production)

## 📦 Dependency Versions

Key dependencies (see requirements.txt for full list):
- Python: 3.11+
- FastAPI: 0.109.0
- SQLAlchemy: 2.0.25
- Pydantic: 2.5.3
- PostgreSQL: 14+

---

**Quick Reference Version: 1.0**  
**Last Updated: 2026-09-01**
