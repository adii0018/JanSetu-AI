"""
Ward API routes.
Provides endpoints for listing available wards.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.database import get_db
from app.models.ward import Ward
from app.schemas.complaint import WardResponse

router = APIRouter(prefix="/api/wards", tags=["Wards"])


@router.get("", response_model=List[WardResponse])
async def list_wards(db: AsyncSession = Depends(get_db)):
    """
    List all available wards.
    
    Used to populate ward dropdown in frontend complaint submission form.
    Returns wards ordered by name alphabetically.
    """
    result = await db.execute(
        select(Ward).order_by(Ward.name)
    )
    wards = result.scalars().all()
    return wards
