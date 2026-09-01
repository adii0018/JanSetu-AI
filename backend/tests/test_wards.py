"""Tests for ward endpoints."""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_wards(client: AsyncClient):
    """Test listing all wards."""
    response = await client.get("/api/wards")
    
    assert response.status_code == 200
    wards = response.json()
    
    # Should have 6 seeded wards
    assert len(wards) == 6
    
    # Check structure of first ward
    ward = wards[0]
    assert "id" in ward
    assert "name" in ward
    assert "infra_index" in ward
    assert "budget_index" in ward
    
    # Verify ward names (ordered alphabetically)
    ward_names = [w["name"] for w in wards]
    assert "Rajwada" in ward_names
    assert "Vijay Nagar" in ward_names
    assert "Rau" in ward_names
