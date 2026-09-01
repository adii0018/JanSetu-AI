"""Tests for complaint endpoints."""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_submit_complaint(client: AsyncClient):
    """Test submitting a new complaint."""
    complaint_data = {
        "ward_id": 1,
        "raw_text": "Sadak par bahut bade gaddhe hain, urgent repair zaroori hai",
        "language": "Hindi + English",
        "channel": "text"
    }
    
    response = await client.post("/api/complaints", json=complaint_data)
    
    assert response.status_code == 201
    complaint = response.json()
    
    # Check response structure
    assert "id" in complaint
    assert "tracking_id" in complaint
    assert complaint["tracking_id"].startswith("JC-")
    assert complaint["ward_id"] == 1
    assert complaint["raw_text"] == complaint_data["raw_text"]
    assert complaint["category"] in ["Road", "Water Supply", "Health", "Electricity", "Education", "Sanitation", "General / Other"]
    assert 0 <= complaint["confidence"] <= 100
    assert 0 <= complaint["urgency"] <= 100
    assert complaint["status"] == "submitted"


@pytest.mark.asyncio
async def test_submit_complaint_invalid_ward(client: AsyncClient):
    """Test submitting complaint with invalid ward_id."""
    complaint_data = {
        "ward_id": 999,
        "raw_text": "Test complaint",
        "language": "Hindi + English",
        "channel": "text"
    }
    
    response = await client.post("/api/complaints", json=complaint_data)
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_list_complaints(client: AsyncClient):
    """Test listing complaints."""
    # First submit a complaint
    complaint_data = {
        "ward_id": 1,
        "raw_text": "Test complaint for listing",
        "language": "Hindi + English",
        "channel": "text"
    }
    await client.post("/api/complaints", json=complaint_data)
    
    # List complaints
    response = await client.get("/api/complaints")
    
    assert response.status_code == 200
    complaints = response.json()
    assert len(complaints) >= 1


@pytest.mark.asyncio
async def test_list_complaints_with_filters(client: AsyncClient):
    """Test listing complaints with ward filter."""
    # Submit complaints to different wards
    await client.post("/api/complaints", json={
        "ward_id": 1,
        "raw_text": "Paani ki supply nahi aa rahi",
        "language": "Hindi + English",
        "channel": "text"
    })
    
    await client.post("/api/complaints", json={
        "ward_id": 2,
        "raw_text": "Road repair needed",
        "language": "English",
        "channel": "text"
    })
    
    # Filter by ward_id
    response = await client.get("/api/complaints?ward_id=1")
    
    assert response.status_code == 200
    complaints = response.json()
    
    # All complaints should be from ward 1
    for complaint in complaints:
        assert complaint["ward_id"] == 1


@pytest.mark.asyncio
async def test_get_complaint_by_tracking_id(client: AsyncClient):
    """Test getting complaint by tracking ID."""
    # Submit a complaint
    submit_response = await client.post("/api/complaints", json={
        "ward_id": 1,
        "raw_text": "Test complaint",
        "language": "Hindi + English",
        "channel": "text"
    })
    
    tracking_id = submit_response.json()["tracking_id"]
    
    # Get complaint by tracking ID
    response = await client.get(f"/api/complaints/{tracking_id}")
    
    assert response.status_code == 200
    complaint = response.json()
    assert complaint["tracking_id"] == tracking_id


@pytest.mark.asyncio
async def test_get_complaint_invalid_tracking_id(client: AsyncClient):
    """Test getting complaint with invalid tracking ID."""
    response = await client.get("/api/complaints/JC-99999")
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()
