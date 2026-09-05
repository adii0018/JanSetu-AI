"""
Pydantic schemas for complaint requests and responses.
Separate from ORM models to maintain clean separation of concerns.
"""
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional
from app.models.complaint import ComplaintChannel, ComplaintStatus


class ComplaintCreate(BaseModel):
    """Schema for creating a new complaint."""
    ward_id: int = Field(..., gt=0, description="ID of the ward where complaint originates")
    raw_text: str = Field(..., min_length=10, max_length=2000, description="Complaint text from citizen")
    language: str = Field(default="Hindi + English", min_length=1, max_length=50, description="Language of complaint")
    channel: ComplaintChannel = Field(default=ComplaintChannel.TEXT, description="Submission channel")
    
    @field_validator('raw_text', 'language')
    @classmethod
    def validate_not_empty(cls, v: str) -> str:
        """Ensure string fields are not just whitespace."""
        if not v or not v.strip():
            raise ValueError('Field cannot be empty or whitespace only')
        return v.strip()


class ComplaintResponse(BaseModel):
    """Schema for complaint response."""
    id: int
    tracking_id: str
    ward_id: int
    raw_text: str
    language: str
    channel: str
    category: str
    confidence: int
    urgency: int
    status: str
    upvote_count: int = 0
    created_at: datetime
    
    model_config = {"from_attributes": True}


class ComplaintListParams(BaseModel):
    """Schema for complaint list query parameters."""
    ward_id: Optional[int] = None
    category: Optional[str] = None
    limit: int = Field(default=25, ge=1, le=100)
    offset: int = Field(default=0, ge=0)


class WardResponse(BaseModel):
    """Schema for ward response."""
    id: int
    name: str
    infra_index: int
    budget_index: int
    lat: Optional[float] = None
    lng: Optional[float] = None
    
    model_config = {"from_attributes": True}


class WardMapData(BaseModel):
    """Schema for ward map data with complaint stats."""
    id: int
    name: str
    lat: float
    lng: float
    complaint_count: int
    avg_urgency: float
    infra_index: int
    budget_index: int
    
    model_config = {"from_attributes": True}
