"""Tests for input validation and error handling."""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_submit_complaint_empty_text(client: AsyncClient):
    """Test submitting complaint with empty raw_text."""
    complaint_data = {
        "ward_id": 1,
        "raw_text": "",
        "language": "English",
        "channel": "text"
    }
    
    response = await client.post("/api/complaints", json=complaint_data)
    
    # Should fail validation
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_submit_complaint_whitespace_only(client: AsyncClient):
    """Test submitting complaint with whitespace-only raw_text."""
    complaint_data = {
        "ward_id": 1,
        "raw_text": "   \t\n   ",
        "language": "English",
        "channel": "text"
    }
    
    response = await client.post("/api/complaints", json=complaint_data)
    
    # Should fail validation
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_submit_complaint_text_too_short(client: AsyncClient):
    """Test submitting complaint with text shorter than min_length."""
    complaint_data = {
        "ward_id": 1,
        "raw_text": "short",  # Less than 10 characters
        "language": "English",
        "channel": "text"
    }
    
    response = await client.post("/api/complaints", json=complaint_data)
    
    # Should fail validation
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_submit_complaint_text_too_long(client: AsyncClient):
    """Test submitting complaint with text longer than max_length."""
    complaint_data = {
        "ward_id": 1,
        "raw_text": "x" * 2001,  # More than 2000 characters
        "language": "English",
        "channel": "text"
    }
    
    response = await client.post("/api/complaints", json=complaint_data)
    
    # Should fail validation
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_submit_complaint_negative_ward_id(client: AsyncClient):
    """Test submitting complaint with negative ward_id."""
    complaint_data = {
        "ward_id": -1,
        "raw_text": "Test complaint",
        "language": "English",
        "channel": "text"
    }
    
    response = await client.post("/api/complaints", json=complaint_data)
    
    # Should fail validation
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_submit_complaint_zero_ward_id(client: AsyncClient):
    """Test submitting complaint with zero ward_id."""
    complaint_data = {
        "ward_id": 0,
        "raw_text": "Test complaint",
        "language": "English",
        "channel": "text"
    }
    
    response = await client.post("/api/complaints", json=complaint_data)
    
    # Should fail validation (must be gt=0)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_submit_complaint_invalid_channel(client: AsyncClient):
    """Test submitting complaint with invalid channel."""
    complaint_data = {
        "ward_id": 1,
        "raw_text": "Test complaint",
        "language": "English",
        "channel": "invalid_channel"
    }
    
    response = await client.post("/api/complaints", json=complaint_data)
    
    # Should fail validation
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_list_complaints_negative_ward_filter(client: AsyncClient):
    """Test listing complaints with negative ward_id filter."""
    response = await client.get("/api/complaints?ward_id=-1")
    
    # Should fail validation
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_list_complaints_invalid_limit(client: AsyncClient):
    """Test listing complaints with limit > 100."""
    response = await client.get("/api/complaints?limit=101")
    
    # Should fail validation
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_list_complaints_negative_offset(client: AsyncClient):
    """Test listing complaints with negative offset."""
    response = await client.get("/api/complaints?offset=-1")
    
    # Should fail validation
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_error_response_format(client: AsyncClient):
    """Test that error responses have consistent format."""
    # Trigger a validation error
    response = await client.post("/api/complaints", json={
        "ward_id": -1,
        "raw_text": "x"
    })
    
    assert response.status_code == 422
    data = response.json()
    
    # Should have error or detail field
    assert "error" in data or "detail" in data
