"""
Pydantic schemas for complaint requests and responses.
Separate from ORM models to maintain clean separation of concerns.
"""
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional
from app.models.complaint import ComplaintChannel, ComplaintStatus


from typing import Optional, Union, Any

class ComplaintCreate(BaseModel):
    """Schema for creating a new complaint."""
    ward_id: Optional[Any] = Field(default=0, description="ID of the ward (0 or None = AI auto-detects from text)")
    raw_text: str = Field(..., min_length=3, max_length=2000, description="Complaint text from citizen")
    language: str = Field(default="Hindi + English", min_length=1, max_length=50, description="Language of complaint")
    channel: Any = Field(default=ComplaintChannel.TEXT, description="Submission channel (text, voice, whatsapp)")
    user_id: Optional[int] = Field(default=None, description="Optional associated User ID")
    user_email: Optional[str] = Field(default=None, description="Optional associated User Email")

    @field_validator('ward_id', mode='before')
    @classmethod
    def parse_ward_id(cls, v: Any) -> Optional[int]:
        """Safely convert ward_id to int or 0."""
        if v is None or v == "" or v == "0":
            return 0
        try:
            val = int(v)
            return val if val >= 0 else 0
        except (ValueError, TypeError):
            return 0

    @field_validator('channel', mode='before')
    @classmethod
    def parse_channel(cls, v: Any) -> ComplaintChannel:
        """Safely parse channel case-insensitively."""
        if isinstance(v, ComplaintChannel):
            return v
        if isinstance(v, str):
            clean_v = v.strip().lower()
            if clean_v in ("voice", "audio"):
                return ComplaintChannel.VOICE
            elif clean_v in ("whatsapp", "wa"):
                return ComplaintChannel.WHATSAPP
        return ComplaintChannel.TEXT

    @field_validator('raw_text', 'language', mode='before')
    @classmethod
    def validate_not_empty(cls, v: Any) -> str:
        """Ensure string fields are not empty or whitespace only."""
        if not v or not str(v).strip():
            raise ValueError('Field cannot be empty or whitespace only')
        return str(v).strip()


class ComplaintResponse(BaseModel):
    """Schema for complaint response."""
    id: int
    tracking_id: str
    user_id: Optional[int] = None
    user_email: Optional[str] = None
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
