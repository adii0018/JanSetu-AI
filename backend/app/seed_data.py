"""
Data seeding functions for initial ward data and demo complaints.
Called on application startup if database is empty.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.models.ward import Ward
from app.models.complaint import Complaint, ComplaintChannel
import random
import string
import logging

logger = logging.getLogger(__name__)

# Fixed ward data (always seeded first)
WARD_DATA = [
    {"name": "Rajwada", "infra_index": 35, "budget_index": 30, "lat": 22.7196, "lng": 75.8577},
    {"name": "Vijay Nagar", "infra_index": 80, "budget_index": 75, "lat": 22.7535, "lng": 75.8867},
    {"name": "Bhawarkuan", "infra_index": 55, "budget_index": 50, "lat": 22.7021, "lng": 75.8681},
    {"name": "Palasia", "infra_index": 60, "budget_index": 55, "lat": 22.7278, "lng": 75.8703},
    {"name": "Rau", "infra_index": 25, "budget_index": 20, "lat": 22.6428, "lng": 75.8098},
    {"name": "Sudama Nagar", "infra_index": 50, "budget_index": 45, "lat": 22.6894, "lng": 75.8442},
]

# Demo complaint data (seeded if complaints table is empty)
SEED_COMPLAINTS = [
    {"ward": "Rajwada", "text": "10 din se paani ki supply nahi aa rahi, bahut pareshani ho rahi hai", "category": "Water Supply", "urgency": 88},
    {"ward": "Rajwada", "text": "Sadak par bade gaddhe hain, accident ho sakta hai", "category": "Road", "urgency": 70},
    {"ward": "Rau", "text": "Naye area mein street light nahi lagi, raat ko andhera rehta hai", "category": "Electricity", "urgency": 55},
    {"ward": "Rau", "text": "Government school mein teacher hi nahi aate, bachchon ki padhai kharab ho rahi hai", "category": "Education", "urgency": 75},
    {"ward": "Bhawarkuan", "text": "Drain overflow ho raha hai, safai nahi ho rahi hafto se", "category": "Sanitation", "urgency": 65},
    {"ward": "Sudama Nagar", "text": "Transformer kharab hai, power cut roz ho raha hai", "category": "Electricity", "urgency": 60},
    {"ward": "Palasia", "text": "Hospital mein ambulance available nahi thi emergency mein", "category": "Health", "urgency": 90},
    {"ward": "Vijay Nagar", "text": "Road repair ka kaam adha chhod diya gaya hai", "category": "Road", "urgency": 40},
    {"ward": "Rajwada", "text": "Public toilet ki halat bahut kharab hai, safai zaroori hai", "category": "Sanitation", "urgency": 50},
    {"ward": "Rau", "text": "Paani ka pipeline leak ho raha hai kai hafto se", "category": "Water Supply", "urgency": 72},
]


def generate_tracking_id() -> str:
    """Generate unique tracking ID in format JS-XXXXX."""
    digits = ''.join(random.choices(string.digits, k=5))
    return f"JS-{digits}"


async def seed_wards(db: AsyncSession) -> None:
    """
    Seed ward data if wards table is empty.
    
    Args:
        db: Async database session
    """
    # Check if wards already exist
    result = await db.execute(select(Ward).limit(1))
    if result.scalar_one_or_none() is not None:
        return  # Wards already seeded
    
    # Insert ward data
    for ward_data in WARD_DATA:
        ward = Ward(**ward_data)
        db.add(ward)
    
    await db.commit()
    logger.info(f"Seeded {len(WARD_DATA)} wards")


async def seed_complaints(db: AsyncSession) -> None:
    """
    Seed demo complaint data if complaints table is empty.
    
    Args:
        db: Async database session
    """
    # Check if complaints already exist
    result = await db.execute(select(Complaint).limit(1))
    if result.scalar_one_or_none() is not None:
        return  # Complaints already seeded
    
    # Get ward name to ID mapping
    result = await db.execute(select(Ward))
    wards = result.scalars().all()
    ward_map = {ward.name: ward.id for ward in wards}
    
    # Insert complaint data
    for complaint_data in SEED_COMPLAINTS:
        ward_id = ward_map.get(complaint_data["ward"])
        if ward_id is None:
            logger.warning(f"Ward '{complaint_data['ward']}' not found, skipping complaint")
            continue  # Skip if ward not found
        
        # Ensure confidence and urgency are within bounds (0-100)
        confidence = min(100, max(0, 90))
        urgency = min(100, max(0, complaint_data["urgency"]))
        
        complaint = Complaint(
            tracking_id=generate_tracking_id(),
            ward_id=ward_id,
            raw_text=complaint_data["text"],
            language="Hindi + English",
            channel=ComplaintChannel.TEXT,
            category=complaint_data["category"],
            confidence=confidence,
            urgency=urgency,
        )
        db.add(complaint)
    
    await db.commit()
    logger.info(f"Seeded {len(SEED_COMPLAINTS)} demo complaints")


async def reset_demo_data(db: AsyncSession) -> None:
    """
    Delete all complaints and re-seed demo data.
    Used for hackathon/demo resets.
    
    This operation is idempotent - can be called multiple times safely.
    
    Args:
        db: Async database session
    """
    # Use DELETE statement for efficiency (instead of fetching all rows)
    await db.execute(delete(Complaint))
    await db.commit()
    
    logger.info("Deleted all existing complaints")
    
    # Re-seed complaints
    await seed_complaints(db)
    
    logger.info("Demo data reset completed")
