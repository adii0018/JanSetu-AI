"""
Priority engine for calculating ward-level investment priorities.
Uses weighted scoring based on demand, infrastructure gap, and budget gap.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Dict
from app.models.ward import Ward
from app.models.complaint import Complaint


async def calculate_ward_priorities(db: AsyncSession) -> List[Dict]:
    """
    Calculate priority scores for all wards based on complaints, infrastructure, and budget.
    
    Priority formula:
        demand_score = (ward_complaints / max_complaints) * 100
        infra_gap = 100 - infra_index
        budget_gap = 100 - budget_index
        priority_score = demand_score * 0.45 + infra_gap * 0.30 + budget_gap * 0.25
    
    Args:
        db: Async database session
        
    Returns:
        List of dictionaries sorted by priority_score (descending), each containing:
            - ward_name: Ward name
            - complaint_count: Number of complaints in ward
            - demand_score: Normalized demand score (0-100)
            - infra_gap: Infrastructure gap (0-100)
            - budget_gap: Budget gap (0-100)
            - priority_score: Overall priority score (0-100)
    """
    # Get all wards with their complaint counts
    stmt = (
        select(
            Ward.id,
            Ward.name,
            Ward.infra_index,
            Ward.budget_index,
            func.count(Complaint.id).label('complaint_count')
        )
        .outerjoin(Complaint, Ward.id == Complaint.ward_id)
        .group_by(Ward.id, Ward.name, Ward.infra_index, Ward.budget_index)
    )
    
    result = await db.execute(stmt)
    ward_data = result.all()
    
    # Find max complaint count (guard against division by zero)
    max_complaints = max((row.complaint_count for row in ward_data), default=0)
    if max_complaints == 0:
        max_complaints = 1  # Avoid division by zero
    
    # Calculate priority scores
    priorities = []
    for row in ward_data:
        # Demand score (normalized complaint count)
        demand_score = (row.complaint_count / max_complaints) * 100
        
        # Infrastructure gap (inverse of existing quality)
        infra_gap = 100 - row.infra_index
        
        # Budget gap (inverse of existing allocation)
        budget_gap = 100 - row.budget_index
        
        # Weighted priority score
        # Weights: Demand 45%, Infrastructure 30%, Budget 25%
        priority_score = round(
            demand_score * 0.45 +
            infra_gap * 0.30 +
            budget_gap * 0.25
        )
        
        priorities.append({
            "ward_name": row.name,
            "complaint_count": row.complaint_count,
            "demand_score": round(demand_score, 2),
            "infra_gap": infra_gap,
            "budget_gap": budget_gap,
            "priority_score": priority_score
        })
    
    # Sort by priority score (descending)
    priorities.sort(key=lambda x: x["priority_score"], reverse=True)
    
    return priorities
