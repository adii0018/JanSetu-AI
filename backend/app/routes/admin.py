"""
Admin Panel API Routes — JanSetu AI
Secure endpoints for government officers / department admins.
Protected by Admin Secret Key header.
"""
from fastapi import APIRouter, Depends, HTTPException, Header, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, update
from typing import Optional, List
import logging

from app.database import get_db
from app.models.complaint import Complaint, ComplaintStatus
from app.models.user import User
from app.models.ward import Ward

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin", tags=["Admin Panel"])

# ── Admin Secret Key (demo — hardcoded for hackathon) ──────────
ADMIN_SECRET = "jansetu-admin-2026"


def verify_admin(x_admin_key: Optional[str] = Header(None)):
    """Validate admin secret key from request header."""
    if x_admin_key != ADMIN_SECRET:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing Admin Key. Access denied."
        )
    return True


# ── Stats Overview ─────────────────────────────────────────────
@router.get("/stats")
async def get_admin_stats(
    _: bool = Depends(verify_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Admin dashboard stats:
    - Total, Pending, Under Review, Resolved, Approved complaint counts
    - Category breakdown
    - Registered users count
    """
    # Total complaints
    total_result = await db.execute(select(func.count(Complaint.id)))
    total = total_result.scalar() or 0

    # Count by status
    status_counts = {}
    for s in ComplaintStatus:
        r = await db.execute(
            select(func.count(Complaint.id)).where(Complaint.status == s)
        )
        status_counts[s.value] = r.scalar() or 0

    # Category breakdown (top 8)
    cat_result = await db.execute(
        select(Complaint.category, func.count(Complaint.id).label("cnt"))
        .group_by(Complaint.category)
        .order_by(desc("cnt"))
        .limit(8)
    )
    categories = [{"category": row.category, "count": row.cnt} for row in cat_result.all()]

    # High urgency complaints (urgency >= 70)
    high_urgency_result = await db.execute(
        select(func.count(Complaint.id)).where(Complaint.urgency >= 70)
    )
    high_urgency = high_urgency_result.scalar() or 0

    # Total users
    user_result = await db.execute(select(func.count(User.id)))
    total_users = user_result.scalar() or 0

    # Verified users
    verified_result = await db.execute(
        select(func.count(User.id)).where(User.is_verified == True)
    )
    verified_users = verified_result.scalar() or 0

    return {
        "total_complaints": total,
        "status_breakdown": status_counts,
        "category_breakdown": categories,
        "high_urgency_complaints": high_urgency,
        "total_users": total_users,
        "verified_users": verified_users,
    }


# ── All Complaints (Paginated + Filters) ──────────────────────
@router.get("/complaints")
async def get_all_complaints(
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    category: Optional[str] = Query(None, description="Filter by category"),
    urgency_min: int = Query(0, ge=0, le=100),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    _: bool = Depends(verify_admin),
    db: AsyncSession = Depends(get_db)
):
    """List all complaints with optional filters and pagination."""
    q = (
        select(
            Complaint.id,
            Complaint.tracking_id,
            Complaint.user_email,
            Complaint.raw_text,
            Complaint.category,
            Complaint.urgency,
            Complaint.confidence,
            Complaint.status,
            Complaint.channel,
            Complaint.language,
            Complaint.upvote_count,
            Complaint.created_at,
            Ward.name.label("ward_name"),
        )
        .outerjoin(Ward, Complaint.ward_id == Ward.id)
        .order_by(desc(Complaint.urgency), desc(Complaint.created_at))
    )

    if status_filter:
        q = q.where(Complaint.status == status_filter)
    if category:
        q = q.where(Complaint.category == category)
    if urgency_min > 0:
        q = q.where(Complaint.urgency >= urgency_min)

    q = q.limit(limit).offset(offset)
    result = await db.execute(q)
    rows = result.all()

    complaints = []
    for row in rows:
        complaints.append({
            "id": row.id,
            "tracking_id": row.tracking_id,
            "user_email": row.user_email or "Anonymous",
            "raw_text": row.raw_text[:200] + "..." if len(row.raw_text) > 200 else row.raw_text,
            "category": row.category,
            "urgency": row.urgency,
            "confidence": row.confidence,
            "status": row.status.value if hasattr(row.status, "value") else str(row.status),
            "channel": row.channel.value if hasattr(row.channel, "value") else str(row.channel),
            "language": row.language,
            "upvote_count": row.upvote_count,
            "ward_name": row.ward_name or "Unknown",
            "created_at": row.created_at.strftime("%Y-%m-%d %H:%M") if row.created_at else "",
        })

    return {"complaints": complaints, "total": len(complaints), "offset": offset}


# ── Update Complaint Status ───────────────────────────────────
@router.put("/complaints/{tracking_id}/status")
async def update_complaint_status(
    tracking_id: str,
    payload: dict,
    _: bool = Depends(verify_admin),
    db: AsyncSession = Depends(get_db)
):
    """Update a complaint's status (submitted/under_review/approved/resolved)."""
    new_status = payload.get("status")
    valid_statuses = [s.value for s in ComplaintStatus]

    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{new_status}'. Must be one of: {valid_statuses}"
        )

    result = await db.execute(
        select(Complaint).where(Complaint.tracking_id == tracking_id)
    )
    complaint = result.scalar_one_or_none()

    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint '{tracking_id}' not found"
        )

    old_status = complaint.status.value if hasattr(complaint.status, "value") else str(complaint.status)
    complaint.status = ComplaintStatus(new_status)
    await db.commit()
    await db.refresh(complaint)

    logger.info(f"Admin updated complaint {tracking_id}: {old_status} → {new_status}")
    return {
        "success": True,
        "tracking_id": tracking_id,
        "old_status": old_status,
        "new_status": new_status,
    }


# ── All Users ─────────────────────────────────────────────────
@router.get("/users")
async def get_all_users(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    _: bool = Depends(verify_admin),
    db: AsyncSession = Depends(get_db)
):
    """List all registered citizens."""
    result = await db.execute(
        select(
            User.id,
            User.full_name,
            User.email,
            User.city_ward,
            User.is_verified,
            User.created_at,
        )
        .order_by(desc(User.created_at))
        .limit(limit)
        .offset(offset)
    )
    rows = result.all()

    users = []
    for row in rows:
        users.append({
            "id": row.id,
            "full_name": row.full_name,
            "email": row.email,
            "city_ward": row.city_ward or "Pan-India",
            "is_verified": row.is_verified,
            "created_at": row.created_at.strftime("%Y-%m-%d %H:%M") if row.created_at else "",
        })

    return {"users": users, "total": len(users)}
