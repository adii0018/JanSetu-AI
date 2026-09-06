"""
Breeth AI (thebreeth.com) Intent Memory Integration Service.
Provides persistent, intent-aware long-term memory for citizens and AI intake.
"""
import logging
import httpx
from typing import Optional, Dict, Any
from app.config import settings

logger = logging.getLogger(__name__)

BREETH_API_KEY = getattr(settings, "breeth_api_key", None) or "ck_live_nQb1WlsPt8wssvC_QqEfYYPG_M1ucU09UcJXMrlTFUE"
BREETH_BASE_URL = "https://api.thebreeth.com/v1"


async def save_citizen_memory(
    session_id: str,
    raw_text: str,
    tracking_id: str,
    ward_name: str,
    category: str,
    urgency: int
) -> Optional[Dict[str, Any]]:
    """
    Store citizen complaint intent & entities into Breeth Long-Term Memory graph.
    """
    if not BREETH_API_KEY:
        logger.warning("Breeth API Key missing, skipping memory save.")
        return None

    url = f"{BREETH_BASE_URL}/episodes"
    headers = {
        "Authorization": f"Bearer {BREETH_API_KEY}",
        "Content-Type": "application/json"
    }

    content_summary = (
        f"Citizen filed complaint {tracking_id} in {ward_name}. "
        f"Category: {category}, Urgency: {urgency}/100. "
        f"Details: {raw_text}"
    )

    payload = {
        "content": content_summary,
        "group_id": session_id,
        "extract_intent": True
    }

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json=payload, headers=headers, timeout=8.0)
            if resp.status_code == 200:
                data = resp.json()
                logger.info(f"Breeth Memory Saved successfully for session '{session_id}': Episode {data.get('episode_name')}")
                return data
            else:
                logger.error(f"Breeth Memory Save failed: HTTP {resp.status_code} - {resp.text}")
                return None
    except Exception as e:
        logger.error(f"Error saving to Breeth Memory: {e}")
        return None


async def recall_citizen_memory(session_id: str, query: str = "complaint status history") -> Optional[Dict[str, Any]]:
    """
    Perform hybrid retrieval (BM25 + Vector + Graph) from Breeth Memory to recall past citizen context.
    """
    if not BREETH_API_KEY:
        return None

    url = f"{BREETH_BASE_URL}/search"
    headers = {
        "Authorization": f"Bearer {BREETH_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "query": query,
        "group_id": session_id
    }

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json=payload, headers=headers, timeout=8.0)
            if resp.status_code == 200:
                data = resp.json()
                logger.info(f"Breeth Memory Recalled for session '{session_id}'")
                return data
            else:
                logger.error(f"Breeth Search failed: HTTP {resp.status_code} - {resp.text}")
                return None
    except Exception as e:
        logger.error(f"Error searching Breeth Memory: {e}")
        return None
