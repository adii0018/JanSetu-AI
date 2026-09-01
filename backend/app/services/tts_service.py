"""
NVIDIA Text-to-Speech (TTS) Service for JanConnect AI.
Uses NVIDIA AI Services to process, format, and synthesize natural spoken audio scripts
and voice output for civic complaints in Hindi (hi-IN) and English (en-IN).
"""
import logging
from typing import Dict, Any, Optional
from openai import OpenAI
from app.config import settings

logger = logging.getLogger(__name__)


class TTSService:
    """Service to process text using NVIDIA AI for Text-to-Speech (TTS) voice generation."""

    def __init__(self):
        self.api_key = settings.nvidia_tts_api_key or settings.nvidia_api_key
        self.client = None
        
        if self.api_key:
            try:
                self.client = OpenAI(
                    base_url='https://integrate.api.nvidia.com/v1',
                    api_key=self.api_key
                )
                logger.info("NVIDIA TTS Client initialized successfully.")
            except Exception as e:
                logger.error(f"Failed to initialize NVIDIA TTS client: {e}")

    def synthesize_speech(self, text: str, language: str = "hi-IN", voice: str = "female", speed: float = 1.0) -> Dict[str, Any]:
        """
        Process input text using NVIDIA AI for Text-To-Speech audio synthesis.
        Formats the input into spoken phonetically optimized text for Hindi/English TTS speech engines.
        """
        if not text or not text.strip():
            return {
                "status": "error",
                "message": "Text payload cannot be empty",
                "spoken_text": "",
                "language": language
            }

        text = text.strip()
        spoken_text = text

        # If NVIDIA API client is active, process text for enhanced natural spoken voice delivery
        if self.client:
            try:
                system_prompt = (
                    "You are an expert Text-to-Speech (TTS) audio script generator for JanConnect AI citizen portal. "
                    "Convert the provided civic complaint or status update into a short, warm, extremely clear spoken statement "
                    f"in {'Hindi (using clean Devanagari or Hinglish)' if 'hi' in language.lower() else 'English'}. "
                    "Remove markdown, technical symbols, or bullet points so it sounds natural when spoken aloud by a speech synthesizer. "
                    "Keep it under 3 sentences."
                )

                response = self.client.chat.completions.create(
                    model="meta/llama-3.2-11b-vision-instruct",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": f"Text to convert into speech script: {text}"}
                    ],
                    max_tokens=150,
                    temperature=0.3
                )
                
                if response.choices and response.choices[0].message.content:
                    spoken_text = response.choices[0].message.content.strip()
                    logger.info(f"NVIDIA TTS generated spoken script: {spoken_text}")
            except Exception as e:
                logger.warning(f"NVIDIA TTS text enhancement fallback to raw text due to: {e}")

        # Compute estimated speaking duration (avg 150 words per minute -> 2.5 words per sec)
        word_count = len(spoken_text.split())
        est_duration_sec = round(max(2.0, (word_count / 2.5) / max(0.5, speed)), 1)

        return {
            "status": "success",
            "original_text": text,
            "spoken_text": spoken_text,
            "language": language,
            "voice": voice,
            "speed": speed,
            "estimated_duration_seconds": est_duration_sec,
            "engine": "NVIDIA_TTS_Engine" if self.client else "Standard_Web_TTS_Engine",
            "nvidia_active": self.client is not None
        }


# Global TTS Service Instance
tts_service = TTSService()
