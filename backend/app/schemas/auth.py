"""Pydantic schemas for authentication and user profile management."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator


class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    aadhaar_number: Optional[str] = None
    city_ward: Optional[str] = "Pan-India"

    @field_validator("full_name", "city_ward", mode="before")
    @classmethod
    def strip_text(cls, value):
        return value.strip() if isinstance(value, str) else value


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=100)


class GoogleAuthRequest(BaseModel):
    credential: str = Field(..., min_length=20)


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    aadhaar_number: Optional[str] = None
    city_ward: Optional[str] = Field(None, max_length=100)
    avatar_url: Optional[str] = Field(None, max_length=255)


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
