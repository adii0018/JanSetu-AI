"""Admin API routes protected by a server-side secret."""
from typing import Optional
import logging
from fastapi import APIRouter, Depends, HTTPException, Header, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from pydantic import BaseModel, Field
from app.database import get_db
from app.config import settings
from app.models.complaint import Complaint, ComplaintStatus
from app.models.user import User
from app.models.ward import Ward

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin", tags=["Admin Panel"])


def verify_admin(x_admin_key: Optional[str] = Header(None)):
    if not settings.admin_secret or not x_admin_key or x_admin_key != settings.admin_secret:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or missing Admin Key")
    return True


class StatusUpdate(BaseModel):
    status: str = Field(..., min_length=1)


@router.get("/stats")
async def get_admin_stats(_: bool = Depends(verify_admin), db: AsyncSession = Depends(get_db)):
    total = (await db.execute(select(func.count(Complaint.id)))).scalar() or 0
    status_counts = {}
    for item in ComplaintStatus:
        status_counts[item.value] = (await db.execute(select(func.count(Complaint.id)).where(Complaint.status == item))).scalar() or 0
    cat_result = await db.execute(select(Complaint.category, func.count(Complaint.id).label("cnt")).group_by(Complaint.category).order_by(desc("cnt")).limit(8))
    categories = [{"category": row.category, "count": row.cnt} for row in cat_result.all()]
    high_urgency = (await db.execute(select(func.count(Complaint.id)).where(Complaint.urgency >= 70))).scalar() or 0
    total_users = (await db.execute(select(func.count(User.id)))).scalar() or 0
    verified_users = (await db.execute(select(func.count(User.id)).where(User.is_verified.is_(True)))).scalar() or 0
    return {"total_complaints": total, "status_breakdown": status_counts, "category_breakdown": categories, "high_urgency_complaints": high_urgency, "total_users": total_users, "verified_users": verified_users}


@router.get("/complaints")
async def get_all_complaints(status_filter: Optional[str] = Query(None), category: Optional[str] = Query(None), urgency_min: int = Query(0, ge=0, le=100), limit: int = Query(50, ge=1, le=200), offset: int = Query(0, ge=0), _: bool = Depends(verify_admin), db: AsyncSession = Depends(get_db)):
    q = select(Complaint.id, Complaint.tracking_id, Complaint.user_email, Complaint.raw_text, Complaint.category, Complaint.urgency, Complaint.confidence, Complaint.status, Complaint.channel, Complaint.language, Complaint.upvote_count, Complaint.created_at, Ward.name.label("ward_name")).outerjoin(Ward, Complaint.ward_id == Ward.id)
    if status_filter:
        if status_filter not in [s.value for s in ComplaintStatus]:
            raise HTTPException(status_code=400, detail="Invalid status filter")
        q = q.where(Complaint.status == ComplaintStatus(status_filter))
    if category:
        q = q.where(Complaint.category == category.strip())
    if urgency_min:
        q = q.where(Complaint.urgency >= urgency_min)
    rows = (await db.execute(q.order_by(desc(Complaint.urgency), desc(Complaint.created_at)).limit(limit).offset(offset))).all()
    complaints = [{"id": r.id, "tracking_id": r.tracking_id, "user_email": r.user_email or "Anonymous", "raw_text": r.raw_text[:200] + ("..." if len(r.raw_text) > 200 else ""), "category": r.category, "urgency": r.urgency, "confidence": r.confidence, "status": r.status.value, "channel": r.channel.value, "language": r.language, "upvote_count": r.upvote_count, "ward_name": r.ward_name or "Unknown", "created_at": r.created_at.strftime("%Y-%m-%d %H:%M") if r.created_at else ""} for r in rows]
    return {"complaints": complaints, "total": len(complaints), "offset": offset}


@router.put("/complaints/{tracking_id}/status")
async def update_complaint_status(tracking_id: str, payload: StatusUpdate, _: bool = Depends(verify_admin), db: AsyncSession = Depends(get_db)):
    if payload.status not in [s.value for s in ComplaintStatus]:
        raise HTTPException(status_code=400, detail="Invalid complaint status")
    complaint = (await db.execute(select(Complaint).where(Complaint.tracking_id == tracking_id))).scalar_one_or_none()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    old_status = complaint.status.value
    complaint.status = ComplaintStatus(payload.status)
    await db.commit()
    return {"success": True, "tracking_id": tracking_id, "old_status": old_status, "new_status": payload.status}


@router.get("/users")
async def get_all_users(limit: int = Query(100, ge=1, le=500), offset: int = Query(0, ge=0), _: bool = Depends(verify_admin), db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(select(User.id, User.full_name, User.email, User.city_ward, User.is_verified, User.created_at).order_by(desc(User.created_at)).limit(limit).offset(offset))).all()
    users = [{"id": r.id, "full_name": r.full_name, "email": r.email, "city_ward": r.city_ward or "Pan-India", "is_verified": r.is_verified, "created_at": r.created_at.strftime("%Y-%m-%d %H:%M") if r.created_at else ""} for r in rows]
    return {"users": users, "total": len(users)}
