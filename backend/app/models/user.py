"""
User ORM Model for JanSetu AI.
Handles citizen authentication, Aadhaar verification, and profile management.
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=True)  # Nullable for Google Auth users
    aadhaar_number = Column(String(20), nullable=True)    # Masked/Stored securely
    city_ward = Column(String(100), nullable=True)
    avatar_url = Column(String(255), nullable=True)
    is_verified = Column(Boolean, default=False)          # True if Aadhaar provided
    created_at = Column(DateTime(timezone=True), server_default=func.now())
