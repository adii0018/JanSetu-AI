"""
Dashboard API routes.
Provides analytics and priority insights for policymakers.
"""
from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, distinct
from typing import List, Optional
import logging
from app.database import get_db
from app.models.complaint import Complaint
from app.schemas.dashboard import DashboardSummary, WardPriority, CategoryCount
from app.services.priority_engine import calculate_ward_priorities
from app.seed_data import reset_demo_data
from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


def verify_dashboard_access(x_api_key: Optional[str] = Header(None)):
    """
    Verify dashboard API key.
    
    This is a placeholder for proper authentication (e.g., Firebase Auth, JWT).
    In production, replace with proper policymaker authentication.
    
    Args:
        x_api_key: API key from X-API-Key header
        
    Raises:
        HTTPException: 401 if API key is missing or invalid
    """
    if not settings.dashboard_api_key:
        # If no key is configured, allow access (development mode)
        logger.warning("Dashboard API key not configured - allowing access")
        return
    
    if not x_api_key or x_api_key != settings.dashboard_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "Unauthorized", "detail": "Invalid or missing API key"}
        )


@router.get("/summary", response_model=DashboardSummary, dependencies=[Depends(verify_dashboard_access)])
async def get_dashboard_summary(db: AsyncSession = Depends(get_db)):
    """
    Get overall dashboard summary statistics.
    
    Requires X-API-Key header for authentication.
    
    Returns:
    - total_requests: Total number of complaints submitted
    - wards_covered: Number of unique wards with at least one complaint
    - high_urgency_count: Number of complaints with urgency >= 70
    - top_category: Category with most complaints (or null if no complaints)
    """
    # Total complaints
    total_result = await db.execute(
        select(func.count(Complaint.id))
    )
    total_requests = total_result.scalar() or 0
    
    # Wards covered (distinct ward_ids with complaints)
    wards_result = await db.execute(
        select(func.count(distinct(Complaint.ward_id)))
    )
    wards_covered = wards_result.scalar() or 0
    
    # High urgency count (urgency >= 70)
    urgency_result = await db.execute(
        select(func.count(Complaint.id)).where(Complaint.urgency >= 70)
    )
    high_urgency_count = urgency_result.scalar() or 0
    
    # Top category (category with most complaints)
    top_category_result = await db.execute(
        select(
            Complaint.category,
            func.count(Complaint.id).label('count')
        )
        .group_by(Complaint.category)
        .order_by(func.count(Complaint.id).desc())
        .limit(1)
    )
    top_category_row = top_category_result.first()
    top_category = top_category_row[0] if top_category_row else None
    
    return DashboardSummary(
        total_requests=total_requests,
        wards_covered=wards_covered,
        high_urgency_count=high_urgency_count,
        top_category=top_category
    )


@router.get("/priorities", response_model=List[WardPriority], dependencies=[Depends(verify_dashboard_access)])
async def get_ward_priorities(db: AsyncSession = Depends(get_db)):
    """
    Get ward-level priority rankings for investment decisions.
    
    Requires X-API-Key header for authentication.
    
    Calculates priority scores based on:
    - Demand (complaint volume): 45% weight
    - Infrastructure gap: 30% weight
    - Budget gap: 25% weight
    
    Returns wards sorted by priority score (descending).
    Wards with higher scores need more urgent investment.
    """
    priorities = await calculate_ward_priorities(db)
    return priorities


@router.get("/categories", response_model=List[CategoryCount], dependencies=[Depends(verify_dashboard_access)])
async def get_category_distribution(db: AsyncSession = Depends(get_db)):
    """
    Get complaint count grouped by category.
    
    Requires X-API-Key header for authentication.
    
    Returns categories sorted by complaint count (descending).
    Helps policymakers understand which sectors need most attention.
    """
    result = await db.execute(
        select(
            Complaint.category,
            func.count(Complaint.id).label('count')
        )
        .group_by(Complaint.category)
        .order_by(func.count(Complaint.id).desc())
    )
    
    categories = [
        CategoryCount(category=row[0], count=row[1])
        for row in result.all()
    ]
    
    return categories


@router.post("/reset-demo", dependencies=[Depends(verify_dashboard_access)])
async def reset_demo(db: AsyncSession = Depends(get_db)):
    """
    Reset database to demo state.
    
    Requires X-API-Key header for authentication.
    
    Deletes all complaints and re-seeds the 10 sample complaints.
    Useful for hackathon demos and testing.
    
    WARNING: This will delete all existing complaints!
    """
    await reset_demo_data(db)
    
    logger.info("Demo data reset successfully")
    
    return {
        "status": "success",
        "message": "Demo data reset successfully. All complaints deleted and 10 sample complaints re-seeded."
    }
