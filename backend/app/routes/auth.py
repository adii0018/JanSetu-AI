"""
Authentication and User Profile API routes.
Supports Email/Password Auth, Google OAuth simulation, JWT token generation, and Aadhaar verification.
"""
from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import hashlib
import hmac
import base64
import json
import time
import logging
from typing import Optional

from app.database import get_db
from app.models.user import User
from app.schemas.auth import (
    UserRegister,
    UserLogin,
    GoogleAuthRequest,
    UserProfileUpdate,
    UserResponse,
    AuthTokenResponse
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["Authentication"])

SECRET_KEY = "jansetu-secret-jwt-key-2026"

def hash_password(password: str) -> str:
    """Simple SHA-256 password hashing for demo security."""
    return hashlib.sha256((password + SECRET_KEY).encode()).hexdigest()

def create_jwt_token(user_id: int, email: str) -> str:
    """Generate simple base64 JWT-like bearer token."""
    header = base64.b64encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode()).decode()
    payload_data = {
        "sub": str(user_id),
        "email": email,
        "exp": int(time.time()) + (86400 * 30)  # 30 days
    }
    payload = base64.b64encode(json.dumps(payload_data).encode()).decode()
    signature = hmac.new(SECRET_KEY.encode(), f"{header}.{payload}".encode(), hashlib.sha256).hexdigest()
    return f"{header}.{payload}.{signature}"

def decode_jwt_token(token: str) -> Optional[dict]:
    """Decode and verify token."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header, payload, signature = parts
        expected_sig = hmac.new(SECRET_KEY.encode(), f"{header}.{payload}".encode(), hashlib.sha256).hexdigest()
        if expected_sig != signature:
            return None
        decoded_payload = json.loads(base64.b64decode(payload + "==").decode())
        if decoded_payload.get("exp", 0) < time.time():
            return None
        return decoded_payload
    except Exception:
        return None

async def get_current_user(authorization: Optional[str] = Header(None), db: AsyncSession = Depends(get_db)) -> User:
    """Dependency to extract user from Authorization header."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid authentication token")
    token = authorization.split(" ")[1]
    decoded = decode_jwt_token(token)
    if not decoded:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    user_id = int(decoded["sub"])
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

def mask_aadhaar(aadhaar: Optional[str]) -> Optional[str]:
    """Mask Aadhaar number for privacy (e.g. XXXX-XXXX-8921)."""
    if not aadhaar:
        return None
    clean = "".join(filter(str.isdigit, str(aadhaar)))
    if len(clean) >= 4:
        return f"XXXX-XXXX-{clean[-4:]}"
    return "XXXX-XXXX-XXXX"


@router.post("/register", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
async def register_user(data: UserRegister, db: AsyncSession = Depends(get_db)):
    """Register a new citizen account."""
    existing = await db.execute(select(User).where(User.email == data.email.lower().strip()))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    is_verified = bool(data.aadhaar_number and len(str(data.aadhaar_number).strip()) >= 12)
    masked_aadhaar = mask_aadhaar(data.aadhaar_number) if data.aadhaar_number else None

    user = User(
        full_name=data.full_name.strip(),
        email=data.email.lower().strip(),
        hashed_password=hash_password(data.password),
        aadhaar_number=masked_aadhaar,
        city_ward=data.city_ward or "Pan-India",
        is_verified=is_verified,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_jwt_token(user.id, user.email)
    return AuthTokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/login", response_model=AuthTokenResponse)
async def login_user(data: UserLogin, db: AsyncSession = Depends(get_db)):
    """Log in with Email and Password."""
    email_clean = data.email.lower().strip()
    result = await db.execute(select(User).where(User.email == email_clean))
    user = result.scalar_one_or_none()
    
    if not user or user.hashed_password != hash_password(data.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_jwt_token(user.id, user.email)
    return AuthTokenResponse(access_token=token, user=UserResponse.model_validate(user))


import base64
import json

def parse_google_id_token(token: str) -> dict:
    """Parse Google ID token JWT payload without external dependencies."""
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return {}
        payload = parts[1]
        padded = payload + '=' * (-len(payload) % 4)
        decoded_bytes = base64.b64decode(padded)
        return json.loads(decoded_bytes.decode('utf-8'))
    except Exception as e:
        logger.error(f"Error decoding Google ID token: {e}")
        return {}


@router.post("/google", response_model=AuthTokenResponse)
async def google_auth(data: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    """Google OAuth Sign in / Auto-registration."""
    email = data.email
    full_name = data.full_name
    avatar_url = data.avatar_url

    # If Google JWT credential token was passed from Google OAuth Popup:
    if data.credential:
        payload = parse_google_id_token(data.credential)
        if payload.get("email"):
            email = payload.get("email")
            full_name = payload.get("name") or payload.get("given_name") or "Google Citizen"
            avatar_url = payload.get("picture")

    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is required for Google authentication")

    email_clean = email.lower().strip()
    result = await db.execute(select(User).where(User.email == email_clean))
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            full_name=full_name or "Verified Citizen (Google)",
            email=email_clean,
            avatar_url=avatar_url,
            city_ward="Pan-India",
            is_verified=False,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    token = create_jwt_token(user.id, user.email)
    return AuthTokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """Fetch current logged-in user profile."""
    return UserResponse.model_validate(current_user)


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update profile details (Aadhaar verification, City, Name)."""
    if data.full_name is not None and data.full_name.strip():
        current_user.full_name = data.full_name.strip()
    if data.city_ward is not None and data.city_ward.strip():
        current_user.city_ward = data.city_ward.strip()
    if data.avatar_url is not None:
        current_user.avatar_url = data.avatar_url
    if data.aadhaar_number is not None and data.aadhaar_number.strip():
        clean_aadhaar = data.aadhaar_number.strip()
        current_user.aadhaar_number = mask_aadhaar(clean_aadhaar)
        digits_len = len("".join(filter(str.isdigit, clean_aadhaar)))
        if digits_len >= 12:
            current_user.is_verified = True

    await db.commit()
    await db.refresh(current_user)
    return UserResponse.model_validate(current_user)
