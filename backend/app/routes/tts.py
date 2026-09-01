"""
TTS (Text-to-Speech) endpoints for JanConnect AI.
Allows converting complaints and official responses into spoken voice scripts using NVIDIA TTS AI.
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional
from app.services.tts_service import tts_service
from app.config import settings

router = APIRouter(prefix="/api/v1/tts", tags=["Text-To-Speech"])


class TTSRequest(BaseModel):
    text: str = Field(..., description="Text content to be converted into spoken speech script")
    language: Optional[str] = Field("hi-IN", description="Target language: 'hi-IN' for Hindi or 'en-IN' for English")
    voice: Optional[str] = Field("female", description="Voice preference: 'female' or 'male'")
    speed: Optional[float] = Field(1.0, ge=0.5, le=2.0, description="Speech playback speed multiplier (0.5x to 2.0x)")


class TTSResponse(BaseModel):
    status: str
    original_text: str
    spoken_text: str
    language: str
    voice: str
    speed: float
    estimated_duration_seconds: float
    engine: str
    nvidia_active: bool


@router.post("/synthesize", response_model=TTSResponse, summary="Synthesize spoken speech script using NVIDIA TTS AI")
async def synthesize_tts(request: TTSRequest):
    """
    Process text into optimized spoken speech script using NVIDIA Text-To-Speech AI.
    Supports Hindi (`hi-IN`) and English (`en-IN`).
    """
    if not request.text or not request.text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text payload cannot be empty."
        )

    try:
        result = tts_service.synthesize_speech(
            text=request.text,
            language=request.language or "hi-IN",
            voice=request.voice or "female",
            speed=request.speed or 1.0
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process TTS synthesis: {str(e)}"
        )


@router.get("/status", summary="Check NVIDIA TTS engine status")
async def get_tts_status():
    """Returns operational status of the NVIDIA TTS engine."""
    has_key = bool(settings.nvidia_tts_api_key or settings.nvidia_api_key)
    return {
        "status": "operational",
        "nvidia_tts_enabled": has_key,
        "supported_languages": ["hi-IN", "en-IN", "en-US"],
        "supported_voices": ["female", "male"],
        "engine": "NVIDIA_TTS_Engine" if has_key else "Web_Speech_Fallback"
    }
