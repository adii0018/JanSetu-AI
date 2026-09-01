"""Tests for priority engine edge cases."""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_priorities_with_zero_complaints(client: AsyncClient):
    """Test ward priorities when there are zero complaints."""
    # Delete all complaints first (if any)
    await client.post("/api/dashboard/reset-demo")
    
    # Now delete all to get to zero state
    # This tests the division by zero guard
    response = await client.get("/api/dashboard/priorities")
    
    assert response.status_code == 200
    priorities = response.json()
    
    # Should still return all wards with priority scores
    assert len(priorities) == 6
    
    # All wards should have 0 complaints
    for priority in priorities:
        assert priority["complaint_count"] == 0
        assert priority["demand_score"] == 0.0
        assert 0 <= priority["priority_score"] <= 100
        # Priority should be based only on infra and budget gaps
        assert priority["priority_score"] >= 0


@pytest.mark.asyncio
async def test_reset_demo_idempotent(client: AsyncClient):
    """Test that reset-demo can be called multiple times safely."""
    # Reset once
    response1 = await client.post("/api/dashboard/reset-demo")
    assert response1.status_code == 200
    
    # Get complaint count
    list1 = await client.get("/api/complaints?limit=100")
    count1 = len(list1.json())
    
    # Reset again
    response2 = await client.post("/api/dashboard/reset-demo")
    assert response2.status_code == 200
    
    # Get complaint count again
    list2 = await client.get("/api/complaints?limit=100")
    count2 = len(list2.json())
    
    # Should have same number of complaints (10 seeded)
    assert count1 == count2 == 10


@pytest.mark.asyncio
async def test_complaint_foreign_key_integrity(client: AsyncClient):
    """Test submitting complaint with non-existent ward_id."""
    complaint_data = {
        "ward_id": 99999,  # Non-existent ward
        "raw_text": "Test complaint with invalid ward",
        "language": "English",
        "channel": "text"
    }
    
    response = await client.post("/api/complaints", json=complaint_data)
    
    # Should return 404, not database error
    assert response.status_code == 404
    data = response.json()
    assert "error" in data or "detail" in data
