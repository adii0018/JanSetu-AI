# JanSetu - API Documentation

Complete API reference for the JanSetu backend.

Base URL: `http://localhost:8000`

## Authentication

Currently no authentication required (development mode). Authentication will be added for production deployment.

## Response Format

All API responses use JSON format.

### Success Response
```json
{
  "field1": "value1",
  "field2": "value2"
}
```

### Error Response
```json
{
  "detail": "Error message describing what went wrong"
}
```

## Endpoints

---

## Health Check

### GET /

Check if the service is running.

**Response: 200 OK**
```json
{
  "status": "ok",
  "service": "JanSetu Backend"
}
```

---

## Complaints API

### POST /api/complaints

Submit a new citizen complaint.

**Request Body:**
```json
{
  "ward_id": 1,
  "raw_text": "10 din se paani ki supply nahi aa rahi hai",
  "language": "Hindi + English",
  "channel": "text"
}
```

**Fields:**
- `ward_id` (integer, required): ID of the ward (1-6)
- `raw_text` (string, required): Complaint text (10-2000 characters)
- `language` (string, optional): Language of complaint (default: "Hindi + English")
- `channel` (enum, optional): Submission channel - "text", "voice", or "whatsapp" (default: "text")

**Response: 201 Created**
```json
{
  "id": 1,
  "tracking_id": "JS-12345",
  "ward_id": 1,
  "raw_text": "10 din se paani ki supply nahi aa rahi hai",
  "language": "Hindi + English",
  "channel": "text",
  "category": "Water Supply",
  "confidence": 88,
  "urgency": 75,
  "status": "submitted",
  "created_at": "2026-09-01T10:30:00.000Z"
}
```

**Error Responses:**
- `404 Not Found`: Ward ID doesn't exist
- `422 Unprocessable Entity`: Validation error (invalid field values)

**Example cURL:**
```bash
curl -X POST "http://localhost:8000/api/complaints" \
  -H "Content-Type: application/json" \
  -d '{
    "ward_id": 1,
    "raw_text": "Sadak par bahut gaddhe hain",
    "language": "Hindi + English",
    "channel": "text"
  }'
```

---

### GET /api/complaints

List complaints with optional filtering and pagination.

**Query Parameters:**
- `ward_id` (integer, optional): Filter by ward ID
- `category` (string, optional): Filter by category
- `limit` (integer, optional): Number of results (default: 25, max: 100)
- `offset` (integer, optional): Pagination offset (default: 0)

**Response: 200 OK**
```json
[
  {
    "id": 1,
    "tracking_id": "JS-12345",
    "ward_id": 1,
    "raw_text": "10 din se paani ki supply nahi aa rahi hai",
    "language": "Hindi + English",
    "channel": "text",
    "category": "Water Supply",
    "confidence": 88,
    "urgency": 75,
    "status": "submitted",
    "created_at": "2026-09-01T10:30:00.000Z"
  }
]
```

**Example cURL:**
```bash
# List all complaints
curl "http://localhost:8000/api/complaints"

# Filter by ward
curl "http://localhost:8000/api/complaints?ward_id=1"

# Filter by category
curl "http://localhost:8000/api/complaints?category=Water%20Supply"

# Pagination
curl "http://localhost:8000/api/complaints?limit=10&offset=20"
```

---

### GET /api/complaints/{tracking_id}

Get a single complaint by tracking ID. Used by citizens to check complaint status.

**Path Parameters:**
- `tracking_id` (string): Tracking ID (format: JS-XXXXX)

**Response: 200 OK**
```json
{
  "id": 1,
  "tracking_id": "JS-12345",
  "ward_id": 1,
  "raw_text": "10 din se paani ki supply nahi aa rahi hai",
  "language": "Hindi + English",
  "channel": "text",
  "category": "Water Supply",
  "confidence": 88,
  "urgency": 75,
  "status": "submitted",
  "created_at": "2026-09-01T10:30:00.000Z"
}
```

**Error Responses:**
- `404 Not Found`: Tracking ID doesn't exist

**Example cURL:**
```bash
curl "http://localhost:8000/api/complaints/JS-12345"
```

---

## Dashboard API

### GET /api/dashboard/summary

Get overall dashboard statistics for policymakers.

**Response: 200 OK**
```json
{
  "total_requests": 150,
  "wards_covered": 6,
  "high_urgency_count": 45,
  "top_category": "Water Supply"
}
```

**Fields:**
- `total_requests`: Total number of complaints submitted
- `wards_covered`: Number of unique wards with complaints
- `high_urgency_count`: Count of complaints with urgency >= 70
- `top_category`: Category with most complaints (null if no complaints)

**Example cURL:**
```bash
curl "http://localhost:8000/api/dashboard/summary"
```

---

### GET /api/dashboard/priorities

Get ward-level priority rankings for investment decisions.

**Response: 200 OK**
```json
[
  {
    "ward_name": "Rau",
    "complaint_count": 45,
    "demand_score": 100.0,
    "infra_gap": 75,
    "budget_gap": 80,
    "priority_score": 82
  },
  {
    "ward_name": "Rajwada",
    "complaint_count": 38,
    "demand_score": 84.44,
    "infra_gap": 65,
    "budget_gap": 70,
    "priority_score": 72
  }
]
```

**Fields:**
- `ward_name`: Name of the ward
- `complaint_count`: Number of complaints from this ward
- `demand_score`: Normalized demand score (0-100)
- `infra_gap`: Infrastructure gap (100 - infra_index)
- `budget_gap`: Budget gap (100 - budget_index)
- `priority_score`: Overall priority (weighted sum, 0-100)

**Priority Formula:**
```
priority_score = (demand_score × 0.45) + (infra_gap × 0.30) + (budget_gap × 0.25)
```

Wards are sorted by priority_score descending (highest priority first).

**Example cURL:**
```bash
curl "http://localhost:8000/api/dashboard/priorities"
```

---

### GET /api/dashboard/categories

Get complaint distribution by category.

**Response: 200 OK**
```json
[
  {
    "category": "Water Supply",
    "count": 45
  },
  {
    "category": "Road",
    "count": 38
  },
  {
    "category": "Electricity",
    "count": 25
  }
]
```

Categories are sorted by count descending (most complaints first).

**Example cURL:**
```bash
curl "http://localhost:8000/api/dashboard/categories"
```

---

### POST /api/dashboard/reset-demo

Reset database to demo state. Deletes all complaints and re-seeds 10 sample complaints.

⚠️ **WARNING**: This will delete all existing complaints!

**Response: 200 OK**
```json
{
  "status": "success",
  "message": "Demo data reset successfully. All complaints deleted and 10 sample complaints re-seeded."
}
```

**Example cURL:**
```bash
curl -X POST "http://localhost:8000/api/dashboard/reset-demo"
```

---

## Wards API

### GET /api/wards

List all available wards. Used to populate ward selection dropdowns.

**Response: 200 OK**
```json
[
  {
    "id": 1,
    "name": "Bhawarkuan",
    "infra_index": 55,
    "budget_index": 50
  },
  {
    "id": 2,
    "name": "Palasia",
    "infra_index": 60,
    "budget_index": 55
  }
]
```

**Fields:**
- `id`: Ward ID (use this for complaint submission)
- `name`: Ward name
- `infra_index`: Infrastructure quality (0-100, higher is better)
- `budget_index`: Budget allocation (0-100, higher is more allocated)

Wards are sorted alphabetically by name.

**Example cURL:**
```bash
curl "http://localhost:8000/api/wards"
```

---

## Data Models

### Ward

```typescript
{
  id: number;
  name: string;
  infra_index: number;  // 0-100
  budget_index: number; // 0-100
}
```

**Seeded Wards:**
1. Rajwada (infra: 35, budget: 30)
2. Vijay Nagar (infra: 80, budget: 75)
3. Bhawarkuan (infra: 55, budget: 50)
4. Palasia (infra: 60, budget: 55)
5. Rau (infra: 25, budget: 20)
6. Sudama Nagar (infra: 50, budget: 45)

---

### Complaint

```typescript
{
  id: number;
  tracking_id: string;           // Format: JS-XXXXX
  ward_id: number;
  raw_text: string;
  language: string;
  channel: "text" | "voice" | "whatsapp";
  category: string;              // See categories below
  confidence: number;            // 0-100
  urgency: number;               // 0-100
  status: "submitted" | "under_review" | "approved" | "resolved";
  created_at: string;            // ISO 8601 datetime
}
```

**Categories:**
- Water Supply
- Road
- Health
- Electricity
- Education
- Sanitation
- General / Other

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created successfully |
| 404 | Not Found - Resource doesn't exist |
| 422 | Unprocessable Entity - Validation error |
| 500 | Internal Server Error - Server error |

---

## Rate Limiting

Currently no rate limiting (development mode). Will be added for production.

---

## CORS

CORS is enabled for all origins in development mode. Restrict to specific origins in production.

---

## Interactive Documentation

FastAPI provides interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
  - Try out API calls directly in the browser
  - See request/response schemas
  - Test authentication

- **ReDoc**: http://localhost:8000/redoc
  - Alternative documentation view
  - Better for reading/printing

---

## Webhooks (Future)

Webhooks for complaint status updates will be added in future versions.

---

## SDKs & Client Libraries

### Python Example

```python
import httpx
import asyncio

async def submit_complaint():
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:8000/api/complaints",
            json={
                "ward_id": 1,
                "raw_text": "Paani ki supply nahi aa rahi",
                "language": "Hindi + English",
                "channel": "text"
            }
        )
        print(response.json())

asyncio.run(submit_complaint())
```

### JavaScript Example

```javascript
// Submit complaint
const response = await fetch('http://localhost:8000/api/complaints', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    ward_id: 1,
    raw_text: 'Paani ki supply nahi aa rahi',
    language: 'Hindi + English',
    channel: 'text'
  })
});

const complaint = await response.json();
console.log('Tracking ID:', complaint.tracking_id);
```

---

## Support

For issues or questions:
- Check `/docs` for interactive documentation
- Review test files in `tests/` for usage examples
- Open an issue on GitHub
