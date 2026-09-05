"""
Complaint API routes.
Handles complaint submission, listing, and tracking.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Optional
import logging
from app.database import get_db
from app.models.complaint import Complaint
from app.models.ward import Ward
from app.schemas.complaint import ComplaintCreate, ComplaintResponse, WardMapData
from app.services.nlp_service import classify_complaint
from app.seed_data import generate_tracking_id
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy import func as sqlfunc

logger = logging.getLogger(__name__)
limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/api/complaints", tags=["Complaints"])


@router.post("", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def submit_complaint(
    request: Request,
    complaint_data: ComplaintCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Submit a new citizen complaint.
    
    Rate limited to 10 requests per minute per IP address to prevent spam.
    
    Process:
    1. Validates that ward_id exists
    2. Classifies complaint text using NLP service
    3. Generates unique tracking ID
    4. Saves complaint to database
    
    Args:
        complaint_data: Complaint submission data
        db: Database session
    
    Returns:
        ComplaintResponse: Created complaint with tracking ID, category, confidence, urgency
        
    Raises:
        HTTPException: 404 if ward_id doesn't exist
        HTTPException: 429 if rate limit exceeded
        HTTPException: 500 if tracking ID generation fails after retries
    """
    # Validate ward exists
    ward_result = await db.execute(
        select(Ward).where(Ward.id == complaint_data.ward_id)
    )
    ward = ward_result.scalar_one_or_none()
    if not ward:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "Ward not found", "detail": f"Ward with id {complaint_data.ward_id} does not exist"}
        )
    
    # Classify complaint using NLP service
    classification = classify_complaint(complaint_data.raw_text)
    
    # Generate unique tracking ID with retry logic
    max_retries = 10
    tracking_id = None
    for attempt in range(max_retries):
        tracking_id = generate_tracking_id()
        existing = await db.execute(
            select(Complaint).where(Complaint.tracking_id == tracking_id)
        )
        if existing.scalar_one_or_none() is None:
            break
        if attempt == max_retries - 1:
            logger.error(f"Failed to generate unique tracking ID after {max_retries} attempts")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={"error": "Internal server error", "detail": "Unable to generate tracking ID. Please try again."}
            )
    
    # Create complaint
    complaint = Complaint(
        tracking_id=tracking_id,
        ward_id=complaint_data.ward_id,
        raw_text=complaint_data.raw_text,
        language=complaint_data.language,
        channel=complaint_data.channel,
        category=classification["category"],
        confidence=classification["confidence"],
        urgency=classification["urgency"],
    )
    
    db.add(complaint)
    await db.commit()
    await db.refresh(complaint)
    
    logger.info(f"Complaint created: {tracking_id}, ward_id={complaint_data.ward_id}, category={classification['category']}")
    
    return complaint


@router.get("", response_model=List[ComplaintResponse])
async def list_complaints(
    ward_id: Optional[int] = Query(None, gt=0, description="Filter by ward ID"),
    category: Optional[str] = Query(None, min_length=1, max_length=50, description="Filter by category"),
    limit: int = Query(25, ge=1, le=100, description="Number of complaints to return"),
    offset: int = Query(0, ge=0, description="Number of complaints to skip"),
    db: AsyncSession = Depends(get_db)
):
    """
    List complaints with optional filtering.
    
    Query parameters:
    - ward_id: Filter complaints by specific ward (must be positive)
    - category: Filter complaints by category
    - limit: Number of results (default 25, max 100)
    - offset: Pagination offset (default 0)
    
    Returns:
        List[ComplaintResponse]: Complaints ordered by creation date (newest first)
    """
    # Build query with optional filters
    query = select(Complaint)
    
    if ward_id is not None:
        query = query.where(Complaint.ward_id == ward_id)
    
    if category is not None:
        query = query.where(Complaint.category == category.strip())
    
    # Order by newest first, apply pagination
    query = query.order_by(desc(Complaint.created_at)).limit(limit).offset(offset)
    
    result = await db.execute(query)
    complaints = result.scalars().all()
    
    return complaints


@router.get("/map-data", response_model=List[WardMapData])
async def get_map_data(
    db: AsyncSession = Depends(get_db)
):
    """
    Get ward-level complaint heatmap data for the interactive map.
    Returns complaint count and average urgency per ward with coordinates.
    Must be registered BEFORE /{tracking_id} to avoid routing conflicts.
    """
    ward_stats = await db.execute(
        select(
            Ward.id,
            Ward.name,
            Ward.lat,
            Ward.lng,
            Ward.infra_index,
            Ward.budget_index,
            sqlfunc.count(Complaint.id).label("complaint_count"),
            sqlfunc.coalesce(sqlfunc.avg(Complaint.urgency), 0).label("avg_urgency"),
        )
        .outerjoin(Complaint, Ward.id == Complaint.ward_id)
        .where(Ward.lat.isnot(None))
        .group_by(Ward.id, Ward.name, Ward.lat, Ward.lng, Ward.infra_index, Ward.budget_index)
    )
    rows = ward_stats.all()
    return [
        WardMapData(
            id=row.id,
            name=row.name,
            lat=row.lat,
            lng=row.lng,
            complaint_count=row.complaint_count,
            avg_urgency=round(float(row.avg_urgency), 1),
            infra_index=row.infra_index,
            budget_index=row.budget_index,
        )
        for row in rows
    ]


@router.get("/{tracking_id}", response_model=ComplaintResponse)
async def get_complaint_by_tracking_id(
    tracking_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get a single complaint by its tracking ID.
    
    Used by citizens to check the status of their complaint.
    Tracking IDs are in format JS-XXXXX (e.g., JS-12345).
    
    Args:
        tracking_id: Complaint tracking ID
        db: Database session
    
    Returns:
        ComplaintResponse: Complaint details
        
    Raises:
        HTTPException: 404 if tracking ID not found
    """
    result = await db.execute(
        select(Complaint).where(Complaint.tracking_id == tracking_id)
    )
    complaint = result.scalar_one_or_none()
    
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "Complaint not found", "detail": f"Complaint with tracking ID '{tracking_id}' does not exist"}
        )
    
    return complaint


@router.post("/{tracking_id}/upvote", response_model=ComplaintResponse)
async def upvote_complaint(
    tracking_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Upvote a complaint — signals "I have the same problem".
    Citizens can support existing complaints to increase their priority visibility.
    
    Args:
        tracking_id: Complaint tracking ID
        db: Database session
    
    Returns:
        ComplaintResponse: Updated complaint with new upvote_count
    
    Raises:
        HTTPException: 404 if tracking ID not found
    """
    result = await db.execute(
        select(Complaint).where(Complaint.tracking_id == tracking_id)
    )
    complaint = result.scalar_one_or_none()
    
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "Complaint not found", "detail": f"Complaint with tracking ID '{tracking_id}' does not exist"}
        )
    
    complaint.upvote_count = (complaint.upvote_count or 0) + 1
    await db.commit()
    await db.refresh(complaint)
    
    logger.info(f"Complaint {tracking_id} upvoted. Total upvotes: {complaint.upvote_count}")
    return complaint

