"""Breeth AI intent memory integration."""
import logging
from typing import Any, Dict, Optional
import httpx
from app.config import settings

logger = logging.getLogger(__name__)
BREETH_BASE_URL = "https://api.thebreeth.com/v1"

async def save_citizen_memory(session_id: str, raw_text: str, tracking_id: str, ward_name: str, category: str, urgency: int) -> Optional[Dict[str, Any]]:
    if not settings.breeth_api_key:
        return None
    payload = {"content": f"Citizen filed complaint {tracking_id} in {ward_name}. Category: {category}, Urgency: {urgency}/100. Details: {raw_text}", "group_id": session_id, "extract_intent": True}
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{BREETH_BASE_URL}/episodes", json=payload, headers={"Authorization": f"Bearer {settings.breeth_api_key}"}, timeout=8.0)
            response.raise_for_status()
            return response.json()
    except Exception as exc:
        logger.warning("Breeth memory save failed: %s", exc)
        return None

async def recall_citizen_memory(session_id: str, query: str = "complaint status history") -> Optional[Dict[str, Any]]:
    if not settings.breeth_api_key:
        return None
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{BREETH_BASE_URL}/search", json={"query": query, "group_id": session_id}, headers={"Authorization": f"Bearer {settings.breeth_api_key}"}, timeout=8.0)
            response.raise_for_status()
            return response.json()
    except Exception as exc:
        logger.warning("Breeth memory search failed: %s", exc)
        return None
