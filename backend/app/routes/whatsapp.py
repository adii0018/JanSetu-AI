"""
WhatsApp Cloud API Webhook Integration for JanSetu.
Allows receiving citizen civic complaints via WhatsApp (Text, Voice notes, Media)
and automatically linking them to the JanSetu Web Engine.
"""
from fastapi import APIRouter, Request, Response, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import logging

from app.database import get_db
from app.models.complaint import Complaint
from app.services.nlp_service import classify_complaint
from app.seed_data import generate_tracking_id
from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/whatsapp", tags=["WhatsApp Webhook Integration"])


class WhatsAppIncomingPayload(BaseModel):
    phone_number: str = Field(..., description="Citizen WhatsApp mobile number e.g. +918800001915")
    ward_id: Optional[int] = Field(1, description="Assigned ward ID")
    message_text: str = Field(..., description="Message text or voice note transcript sent on WhatsApp")
    language: Optional[str] = Field("Hindi + English", description="Language preference")


@router.get("/webhook", summary="Meta WhatsApp Webhook Verification")
async def verify_webhook(request: Request):
    """
    Verification endpoint for Meta WhatsApp Cloud API / Twilio Webhook setup.
    Responds to Meta's hub.challenge request upon initial Webhook URL configuration.
    """
    params = request.query_params
    verify_token = params.get("hub.verify_token")
    challenge = params.get("hub.challenge")

    if verify_token == "jansetu_whatsapp_verify_token_2026":
        return Response(content=challenge, media_type="text/plain")

    return {"status": "JanSetu WhatsApp Webhook Endpoint Active", "mode": "development"}


@router.post("/webhook", summary="Receive WhatsApp Complaint Webhook")
async def receive_whatsapp_message(payload: WhatsAppIncomingPayload, db: AsyncSession = Depends(get_db)):
    """
    Receive citizen complaints directly sent via WhatsApp.
    
    Flow:
    1. Citizen sends text / voice note on WhatsApp (+91 88000 01915).
    2. Meta/Twilio Webhook forwards JSON payload to this endpoint.
    3. NLP service auto-classifies category & urgency.
    4. Saved to Database & reflected instantly on Policymaker Dashboard.
    5. Returns WhatsApp reply message with Tracking ID.
    """
    raw_text = payload.message_text.strip()
    if not raw_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="WhatsApp message body cannot be empty."
        )

    # Auto classify using NLP Engine
    classification = classify_complaint(raw_text)
    tracking_id = generate_tracking_id()

    # Save complaint to Database
    new_complaint = Complaint(
        tracking_id=tracking_id,
        ward_id=payload.ward_id or 1,
        raw_text=raw_text,
        language=payload.language or "Hindi + English",
        channel="whatsapp",
        category=classification["category"],
        confidence=classification["confidence"],
        urgency=classification["urgency"],
        status="SUBMITTED",
        upvote_count=0
    )
    db.add(new_complaint)
    await db.commit()
    await db.refresh(new_complaint)

    logger.info(f"WhatsApp complaint created: {tracking_id} from {payload.phone_number}")

    # Format automated WhatsApp response for Citizen
    whatsapp_response_message = (
        f"✅ *JanSetu WhatsApp Bot Response*\n\n"
        f"Aapki shikayat darj kar li gayi hai!\n"
        f"🎫 *Tracking ID*: `{tracking_id}`\n"
        f"📂 *Category*: {classification['category']}\n"
        f"🚨 *Urgency Rating*: {classification['urgency']}/100\n\n"
        f"Track Live Status at: http://localhost:5173"
    )

    return {
        "status": "success",
        "tracking_id": tracking_id,
        "phone_number": payload.phone_number,
        "channel": "whatsapp",
        "auto_reply": whatsapp_response_message,
        "complaint": {
            "id": new_complaint.id,
            "category": new_complaint.category,
            "urgency": new_complaint.urgency,
            "status": new_complaint.status
        }
    }
