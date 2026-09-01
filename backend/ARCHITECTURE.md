# JanConnect AI - System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Clients                        │
│         (Web App, Mobile App, WhatsApp Bot)                 │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Backend                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              API Routes Layer                         │  │
│  │  • Health Check (/)                                   │  │
│  │  • Complaints (/api/complaints)                       │  │
│  │  • Dashboard (/api/dashboard)                         │  │
│  │  • Wards (/api/wards)                                 │  │
│  └──────────────────────┬────────────────────────────────┘  │
│                         │                                    │
│  ┌──────────────────────▼─────────────────────────────────┐ │
│  │          Pydantic Validation Layer                     │ │
│  │  • ComplaintCreate / ComplaintResponse                 │ │
│  │  • DashboardSummary / WardPriority                     │ │
│  │  • Input validation / Output serialization             │ │
│  └──────────────────────┬─────────────────────────────────┘ │
│                         │                                    │
│  ┌──────────────────────▼─────────────────────────────────┐ │
│  │           Business Services Layer                      │ │
│  │  ┌─────────────────┐    ┌──────────────────────┐      │ │
│  │  │  NLP Service    │    │  Priority Engine     │      │ │
│  │  │  • classify()   │    │  • calculate()       │      │ │
│  │  │  • Keywords     │    │  • Weighted scoring  │      │ │
│  │  │  • AI stub      │    │  • SQL aggregation   │      │ │
│  │  └─────────────────┘    └──────────────────────┘      │ │
│  └──────────────────────┬─────────────────────────────────┘ │
│                         │                                    │
│  ┌──────────────────────▼─────────────────────────────────┐ │
│  │          SQLAlchemy ORM Layer                          │ │
│  │  • Ward model                                          │ │
│  │  • Complaint model                                     │ │
│  │  • Async session management                            │ │
│  └──────────────────────┬─────────────────────────────────┘ │
└─────────────────────────┼─────────────────────────────────┘
                          │ asyncpg
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                        │
│  ┌──────────────┐              ┌────────────────────────┐   │
│  │ wards        │              │ complaints             │   │
│  │ • id         │◄─────────────│ • id                   │   │
│  │ • name       │  FK          │ • tracking_id          │   │
│  │ • infra_idx  │              │ • ward_id              │   │
│  │ • budget_idx │              │ • raw_text             │   │
│  └──────────────┘              │ • category             │   │
│                                │ • confidence           │   │
│                                │ • urgency              │   │
│                                │ • status               │   │
│                                └────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Request Flow

### 1. Submit Complaint Flow

```
Citizen
  │
  │ POST /api/complaints
  │ { ward_id, raw_text, language, channel }
  ▼
FastAPI Route (complaints.py)
  │
  │ Validate ward_id exists
  ▼
Ward Validation
  │ ✓ Ward found
  ▼
NLP Service (nlp_service.py)
  │
  │ classify_complaint(raw_text)
  │ • Match keywords → category
  │ • Count matches → confidence
  │ • Count urgency words → urgency
  ▼
Generate Tracking ID
  │ JC-12345
  ▼
Database Insert
  │ INSERT INTO complaints ...
  ▼
Response to Citizen
  │ { tracking_id: "JC-12345", category: "Water Supply", ... }
  ▼
Citizen receives tracking ID
```

### 2. Dashboard Priorities Flow

```
Policymaker
  │
  │ GET /api/dashboard/priorities
  ▼
FastAPI Route (dashboard.py)
  │
  ▼
Priority Engine (priority_engine.py)
  │
  │ SELECT wards with complaint counts
  │ JOIN complaints ON ward_id
  │ GROUP BY ward
  ▼
Calculate Scores for Each Ward
  │
  │ demand_score = (complaints / max) × 100
  │ infra_gap = 100 - infra_index
  │ budget_gap = 100 - budget_index
  │ priority = demand×0.45 + infra×0.30 + budget×0.25
  ▼
Sort by Priority (descending)
  │
  ▼
Response to Policymaker
  │ [
  │   { ward_name: "Rau", priority_score: 82, ... },
  │   { ward_name: "Rajwada", priority_score: 72, ... }
  │ ]
  ▼
Policymaker sees investment priorities
```

## Data Flow Diagram

```
┌──────────────┐
│   Citizens   │
│ (Multi-lang) │
└──────┬───────┘
       │ Complaints via
       │ • Text
       │ • Voice → Transcription
       │ • WhatsApp
       ▼
┌──────────────────┐
│  Input Layer     │
│  • Validation    │
│  • Sanitization  │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  NLP Engine      │
│  • Classification│
│  • Scoring       │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Data Storage    │
│  • PostgreSQL    │
│  • Indexed       │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Analytics       │
│  • Aggregation   │
│  • Scoring       │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Dashboard API   │
│  • Summaries     │
│  • Priorities    │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Policymakers    │
│  (Investment     │
│   Decisions)     │
└──────────────────┘
```

## Component Interaction

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Startup                       │
│                                                              │
│  1. Load Config (.env)                                       │
│  2. Initialize Database Connection                           │
│  3. Run Migrations (Alembic)                                 │
│  4. Seed Ward Data (if empty)                                │
│  5. Seed Demo Complaints (if empty)                          │
│  6. Start FastAPI Server                                     │
│  7. Enable CORS                                              │
│  8. Mount Routes                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Request Processing                          │
│                                                              │
│  Request → CORS → Route → Validation → Service → ORM → DB   │
│                                                              │
│  Response ← JSON ← Schema ← Result ← Query ← Session ← DB   │
└─────────────────────────────────────────────────────────────┘
```

## Module Dependencies

```
main.py
  ├── database.py (DB connection)
  ├── config.py (Settings)
  ├── seed_data.py (Initial data)
  └── routes/
      ├── complaints.py
      │   ├── models/complaint.py
      │   ├── models/ward.py
      │   ├── schemas/complaint.py
      │   └── services/nlp_service.py
      ├── dashboard.py
      │   ├── models/complaint.py
      │   ├── models/ward.py
      │   ├── schemas/dashboard.py
      │   └── services/priority_engine.py
      └── wards.py
          ├── models/ward.py
          └── schemas/complaint.py
```

## Database Schema

```sql
-- Ward: Administrative areas
wards
  id              SERIAL PRIMARY KEY
  name            VARCHAR(100) UNIQUE NOT NULL
  infra_index     INTEGER NOT NULL CHECK (0-100)
  budget_index    INTEGER NOT NULL CHECK (0-100)
  
  INDEX idx_wards_id
  INDEX idx_wards_name

-- Complaint: Citizen submissions
complaints
  id              SERIAL PRIMARY KEY
  tracking_id     VARCHAR(20) UNIQUE NOT NULL
  ward_id         INTEGER REFERENCES wards(id)
  raw_text        TEXT NOT NULL
  language        VARCHAR(50) NOT NULL
  channel         ENUM('text','voice','whatsapp') NOT NULL
  category        VARCHAR(50) NOT NULL
  confidence      INTEGER NOT NULL CHECK (0-100)
  urgency         INTEGER NOT NULL CHECK (0-100)
  status          ENUM('submitted','under_review','approved','resolved')
  created_at      TIMESTAMP DEFAULT NOW()
  
  INDEX idx_complaints_id
  INDEX idx_complaints_tracking_id
  INDEX idx_complaints_ward_id
  INDEX idx_complaints_category
  INDEX idx_complaints_created_at
  
  CONSTRAINT fk_ward FOREIGN KEY (ward_id) REFERENCES wards(id)
```

## Classification Algorithm

```
Input: raw_text (string)
Output: { category, confidence, urgency }

Step 1: Normalize text
  text_lower = raw_text.toLowerCase()

Step 2: Category matching
  for each category in CATEGORY_KEYWORDS:
    count = sum(1 for keyword in keywords if keyword in text_lower)
    if count > 0:
      category_matches[category] = count
  
  category = max(category_matches) or "General / Other"
  matches = category_matches[category] or 0

Step 3: Confidence calculation
  confidence = min(97, 60 + matches × 14)

Step 4: Urgency calculation
  urgency_hits = sum(1 for word in URGENCY_WORDS if word in text_lower)
  health_bonus = 12 if category == "Health" else 0
  urgency = min(96, max(30, 38 + urgency_hits × 13 + health_bonus))

Return { category, confidence, urgency }
```

## Priority Scoring Algorithm

```
Input: database session
Output: List[WardPriority] sorted by priority_score

Step 1: Query ward data with complaint counts
  SELECT 
    ward.id, ward.name, ward.infra_index, ward.budget_index,
    COUNT(complaint.id) as complaint_count
  FROM wards
  LEFT JOIN complaints ON ward.id = complaint.ward_id
  GROUP BY ward.id

Step 2: Find max complaint count
  max_complaints = max(complaint_count for each ward)
  if max_complaints == 0:
    max_complaints = 1  # Avoid division by zero

Step 3: Calculate scores for each ward
  for each ward:
    demand_score = (ward.complaint_count / max_complaints) × 100
    infra_gap = 100 - ward.infra_index
    budget_gap = 100 - ward.budget_index
    
    priority_score = round(
      demand_score × 0.45 +
      infra_gap × 0.30 +
      budget_gap × 0.25
    )

Step 4: Sort and return
  Sort wards by priority_score (descending)
  Return list
```

## Error Handling Flow

```
Request
  │
  ▼
Try Block
  │
  ├─── Pydantic Validation Error
  │    └──► HTTP 422 Unprocessable Entity
  │
  ├─── Ward Not Found (404)
  │    └──► HTTP 404 Not Found
  │
  ├─── Tracking ID Not Found
  │    └──► HTTP 404 Not Found
  │
  └─── Database Error
       └──► HTTP 500 Internal Server Error
```

## Scalability Considerations

### Current Architecture (Single Instance)
```
Load Balancer
     │
     ▼
FastAPI Instance
     │
     ▼
PostgreSQL
```

### Future Scaling (Production)
```
                Load Balancer
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
   FastAPI-1     FastAPI-2     FastAPI-3
        │             │             │
        └─────────────┼─────────────┘
                      │
              ┌───────┴────────┐
              │   Redis Cache   │
              └───────┬────────┘
                      │
              ┌───────▼────────┐
              │  PostgreSQL    │
              │  (Primary)     │
              └───────┬────────┘
                      │
              ┌───────▼────────┐
              │  PostgreSQL    │
              │  (Read Replica)│
              └────────────────┘
```

## Security Layers

```
Internet
  │
  ▼
┌─────────────────────┐
│  HTTPS/TLS Layer    │  (Future)
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  Rate Limiting      │  (Future)
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  CORS Validation    │  ✓ Implemented
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  Input Validation   │  ✓ Implemented (Pydantic)
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  Authentication     │  (Future)
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  Authorization      │  (Future)
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  Business Logic     │  ✓ Implemented
└─────────────────────┘
```

## Monitoring & Observability (Future)

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Metrics                      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Logging    │  │   Metrics    │  │   Tracing    │      │
│  │   (Sentry)   │  │  (DataDog)   │  │  (Jaeger)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  • Request/Response logs                                     │
│  • Error tracking                                            │
│  • Performance metrics                                       │
│  • Database query performance                                │
│  • API endpoint latency                                      │
└─────────────────────────────────────────────────────────────┘
```

## Deployment Architecture

### Development
```
Local Machine
  ├── Python venv
  ├── PostgreSQL (local or Supabase)
  └── uvicorn --reload
```

### Production (Recommended)
```
Cloud Provider (AWS/GCP/Azure)
  │
  ├── Container Service (ECS/Cloud Run/App Service)
  │   └── Docker Container (FastAPI)
  │
  ├── Managed PostgreSQL (RDS/Cloud SQL/Azure DB)
  │
  ├── Redis Cache (ElastiCache/Memorystore)
  │
  └── Load Balancer (ALB/Cloud Load Balancing)
```

## Future Enhancements

```
Current                  →  Future
────────────────────────────────────────────────────
Rule-based NLP           →  NVIDIA NIM API
No caching              →  Redis caching
Single instance         →  Multi-instance + LB
No background jobs      →  Celery/RQ for async tasks
No real-time updates    →  WebSocket support
No file uploads         →  S3 for photo attachments
No auth                 →  JWT authentication
No notifications        →  Email/SMS alerts
PostgreSQL only         →  + TimescaleDB for analytics
```

---

This architecture is designed to be:
- **Scalable**: Easy to add instances, caching, read replicas
- **Maintainable**: Clear separation of concerns, modular design
- **Testable**: Dependency injection, async test support
- **Extensible**: Easy to add new features, categories, services
- **Production-Ready**: Docker, migrations, proper error handling
