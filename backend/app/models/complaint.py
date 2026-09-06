"""
Complaint ORM model.
Represents citizen complaints with AI classification and tracking.
"""
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, CheckConstraint, Enum, Float
from sqlalchemy.sql import func
from app.database import Base
import enum


class ComplaintChannel(str, enum.Enum):
    """Complaint submission channel."""
    TEXT = "text"
    VOICE = "voice"
    WHATSAPP = "whatsapp"


class ComplaintStatus(str, enum.Enum):
    """Complaint processing status."""
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    RESOLVED = "resolved"


class Complaint(Base):
    """
    Complaint model representing a citizen complaint.
    
    Attributes:
        id: Primary key
        tracking_id: Unique tracking identifier (format: JS-XXXXX)
        ward_id: Foreign key to Ward
        raw_text: Original complaint text from citizen
        language: Language of complaint (e.g., "Hindi + English")
        channel: Submission channel (text, voice, whatsapp)
        category: AI-classified category
        confidence: AI confidence score (0-100)
        urgency: Calculated urgency score (0-100)
        status: Current processing status
        created_at: Timestamp of complaint creation
    """
    __tablename__ = "complaints"
    
    id = Column(Integer, primary_key=True, index=True)
    tracking_id = Column(String(20), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    user_email = Column(String(150), nullable=True, index=True)
    ward_id = Column(Integer, ForeignKey("wards.id"), nullable=False, index=True)
    raw_text = Column(Text, nullable=False)
    language = Column(String(50), nullable=False, default="Hindi + English")
    channel = Column(Enum(ComplaintChannel), nullable=False, default=ComplaintChannel.TEXT)
    category = Column(String(50), nullable=False, index=True)
    confidence = Column(Integer, nullable=False)
    urgency = Column(Integer, nullable=False)
    status = Column(Enum(ComplaintStatus), nullable=False, default=ComplaintStatus.SUBMITTED)
    upvote_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    
    __table_args__ = (
        CheckConstraint('confidence >= 0 AND confidence <= 100', name='check_confidence_range'),
        CheckConstraint('urgency >= 0 AND urgency <= 100', name='check_urgency_range'),
    )
