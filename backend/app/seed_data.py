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

# Fixed ward data (Pan-India major cities and wards)
WARD_DATA = [
    # Madhya Pradesh
    {"name": "Indore - Rajwada", "infra_index": 35, "budget_index": 30, "lat": 22.7196, "lng": 75.8577},
    {"name": "Indore - Vijay Nagar", "infra_index": 80, "budget_index": 75, "lat": 22.7535, "lng": 75.8867},
    {"name": "Indore - Bhawarkuan", "infra_index": 55, "budget_index": 50, "lat": 22.7021, "lng": 75.8681},
    {"name": "Indore - Palasia", "infra_index": 60, "budget_index": 55, "lat": 22.7278, "lng": 75.8703},
    {"name": "Indore - Rau", "infra_index": 25, "budget_index": 20, "lat": 22.6428, "lng": 75.8098},
    {"name": "Bhopal - MP Nagar", "infra_index": 65, "budget_index": 60, "lat": 23.2332, "lng": 77.4343},
    
    # Delhi NCR
    {"name": "Delhi - Connaught Place", "infra_index": 85, "budget_index": 80, "lat": 28.6315, "lng": 77.2167},
    {"name": "Delhi - Rohini Sector 7", "infra_index": 45, "budget_index": 40, "lat": 28.7495, "lng": 77.0565},
    {"name": "Delhi - Dwarka Sector 10", "infra_index": 70, "budget_index": 65, "lat": 28.5921, "lng": 77.0460},
    {"name": "Noida - Sector 62", "infra_index": 75, "budget_index": 70, "lat": 28.6280, "lng": 77.3649},
    
    # Maharashtra
    {"name": "Mumbai - Andheri West", "infra_index": 60, "budget_index": 55, "lat": 19.1136, "lng": 72.8697},
    {"name": "Mumbai - Bandra West", "infra_index": 80, "budget_index": 75, "lat": 19.0596, "lng": 72.8295},
    {"name": "Mumbai - Dadar Central", "infra_index": 50, "budget_index": 45, "lat": 19.0178, "lng": 72.8478},
    {"name": "Pune - Kothrud", "infra_index": 65, "budget_index": 60, "lat": 18.5074, "lng": 73.8077},
    
    # Karnataka
    {"name": "Bengaluru - Koramangala", "infra_index": 70, "budget_index": 65, "lat": 12.9352, "lng": 77.6245},
    {"name": "Bengaluru - Indiranagar", "infra_index": 75, "budget_index": 70, "lat": 12.9784, "lng": 77.6408},
    {"name": "Bengaluru - Whitefield", "infra_index": 50, "budget_index": 45, "lat": 12.9698, "lng": 77.7499},
    
    # Uttar Pradesh
    {"name": "Lucknow - Hazratganj", "infra_index": 60, "budget_index": 50, "lat": 26.8467, "lng": 80.9462},
    {"name": "Varanasi - Cantt Area", "infra_index": 40, "budget_index": 35, "lat": 25.3176, "lng": 82.9739},
    
    # Rajasthan
    {"name": "Jaipur - Pink City", "infra_index": 55, "budget_index": 50, "lat": 26.9220, "lng": 75.8267},
    
    # Gujarat
    {"name": "Ahmedabad - Navrangpura", "infra_index": 70, "budget_index": 65, "lat": 23.0368, "lng": 72.5611},
    
    # Telangana & Andhra Pradesh
    {"name": "Hyderabad - Hitech City", "infra_index": 85, "budget_index": 80, "lat": 17.4435, "lng": 78.3772},
    
    # Tamil Nadu
    {"name": "Chennai - T. Nagar", "infra_index": 65, "budget_index": 60, "lat": 13.0418, "lng": 80.2341},
    
    # West Bengal
    {"name": "Kolkata - Salt Lake Sector V", "infra_index": 75, "budget_index": 70, "lat": 22.5867, "lng": 88.4171},
]

# Demo complaint data (seeded if complaints table is empty)
SEED_COMPLAINTS = [
    {"ward": "Indore - Rajwada", "text": "10 din se paani ki supply nahi aa rahi, bahut pareshani ho rahi hai", "category": "Water Supply", "urgency": 88},
    {"ward": "Indore - Rajwada", "text": "water issu in indore, no drinking water in tap for 3 days", "category": "Water Supply", "urgency": 85},
    {"ward": "Delhi - Connaught Place", "text": "Drainage overflow near CP Metro station Gate 2, severe smell and sanitation issue", "category": "Sanitation", "urgency": 75},
    {"ward": "Mumbai - Andheri West", "text": "Potholes on Link Road causing major traffic jam and accidents in rainy season", "category": "Road", "urgency": 80},
    {"ward": "Bengaluru - Whitefield", "text": "Street lights not working on ITPL main road for 1 week, unsafe for commuters at night", "category": "Electricity", "urgency": 65},
    {"ward": "Lucknow - Hazratganj", "text": "Garbage dumping near market area, municipal van not coming regularly", "category": "Sanitation", "urgency": 60},
    {"ward": "Hyderabad - Hitech City", "text": "Water pipeline leakage near Cyber Towers causing water wastage", "category": "Water Supply", "urgency": 70},
    {"ward": "Jaipur - Pink City", "text": "Traffic signal broken near Badi Chaupar causing chaos", "category": "Road", "urgency": 55},
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
