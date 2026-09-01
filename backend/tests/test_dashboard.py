"""Tests for dashboard endpoints."""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_dashboard_summary(client: AsyncClient):
    """Test dashboard summary endpoint."""
    # Submit some test complaints
    await client.post("/api/complaints", json={
        "ward_id": 1,
        "raw_text": "Paani ki supply nahi aa rahi bahut urgent hai",
        "language": "Hindi + English",
        "channel": "text"
    })
    
    await client.post("/api/complaints", json={
        "ward_id": 2,
        "raw_text": "Road repair emergency needed",
        "language": "English",
        "channel": "text"
    })
    
    # Get dashboard summary
    response = await client.get("/api/dashboard/summary")
    
    assert response.status_code == 200
    summary = response.json()
    
    # Check structure
    assert "total_requests" in summary
    assert "wards_covered" in summary
    assert "high_urgency_count" in summary
    assert "top_category" in summary
    
    # Verify values
    assert summary["total_requests"] >= 2
    assert summary["wards_covered"] >= 2


@pytest.mark.asyncio
async def test_ward_priorities(client: AsyncClient):
    """Test ward priorities endpoint."""
    # Submit complaints to create demand
    await client.post("/api/complaints", json={
        "ward_id": 1,
        "raw_text": "Paani problem",
        "language": "Hindi + English",
        "channel": "text"
    })
    
    response = await client.get("/api/dashboard/priorities")
    
    assert response.status_code == 200
    priorities = response.json()
    
    # Should have 6 wards
    assert len(priorities) == 6
    
    # Check structure of first priority
    priority = priorities[0]
    assert "ward_name" in priority
    assert "complaint_count" in priority
    assert "demand_score" in priority
    assert "infra_gap" in priority
    assert "budget_gap" in priority
    assert "priority_score" in priority
    
    # Verify priorities are sorted descending
    scores = [p["priority_score"] for p in priorities]
    assert scores == sorted(scores, reverse=True)


@pytest.mark.asyncio
async def test_category_distribution(client: AsyncClient):
    """Test category distribution endpoint."""
    # Submit complaints in different categories
    await client.post("/api/complaints", json={
        "ward_id": 1,
        "raw_text": "Paani ki supply nahi aa rahi",
        "language": "Hindi + English",
        "channel": "text"
    })
    
    await client.post("/api/complaints", json={
        "ward_id": 1,
        "raw_text": "Sadak par gaddhe hain",
        "language": "Hindi + English",
        "channel": "text"
    })
    
    response = await client.get("/api/dashboard/categories")
    
    assert response.status_code == 200
    categories = response.json()
    
    # Should have at least one category
    assert len(categories) >= 1
    
    # Check structure
    category = categories[0]
    assert "category" in category
    assert "count" in category
    
    # Verify sorted descending by count
    counts = [c["count"] for c in categories]
    assert counts == sorted(counts, reverse=True)


@pytest.mark.asyncio
async def test_reset_demo(client: AsyncClient):
    """Test reset demo endpoint."""
    # Submit a complaint first
    await client.post("/api/complaints", json={
        "ward_id": 1,
        "raw_text": "Test complaint",
        "language": "Hindi + English",
        "channel": "text"
    })
    
    # Reset demo data
    response = await client.post("/api/dashboard/reset-demo")
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    
    # Verify complaints were reset - should have 10 seeded complaints
    list_response = await client.get("/api/complaints?limit=100")
    complaints = list_response.json()
    assert len(complaints) == 10
