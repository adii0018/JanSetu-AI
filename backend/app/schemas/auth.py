"""
Pydantic schemas for authentication and user profile management.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=3, max_length=150)
    password: str = Field(..., min_length=6, max_length=100)
    aadhaar_number: Optional[str] = None
    city_ward: Optional[str] = "Pan-India"

class UserLogin(BaseModel):
    email: str
    password: str

class GoogleAuthRequest(BaseModel):
    credential: Optional[str] = None
    email: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    aadhaar_number: Optional[str] = None
    city_ward: Optional[str] = None
    avatar_url: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    aadhaar_number: Optional[str] = None
    city_ward: Optional[str] = None
    avatar_url: Optional[str] = None
    is_verified: bool = False
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
