"""
Pydantic schemas for dashboard analytics responses.
"""
from pydantic import BaseModel
from typing import Optional


class DashboardSummary(BaseModel):
    """Schema for overall dashboard summary statistics."""
    total_requests: int
    wards_covered: int
    high_urgency_count: int
    top_category: Optional[str] = None


class WardPriority(BaseModel):
    """Schema for ward priority ranking."""
    ward_name: str
    complaint_count: int
    demand_score: float
    infra_gap: int
    budget_gap: int
    priority_score: int


class CategoryCount(BaseModel):
    """Schema for category-wise complaint count."""
    category: str
    count: int
