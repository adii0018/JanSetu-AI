"""
NLP service for complaint classification.
Currently uses rule-based keyword matching.
Structured for future integration with NVIDIA NIM API or Bhashini.
"""
from typing import Dict
import logging

logger = logging.getLogger(__name__)

# Comprehensive Multilingual Category keyword mappings (Hindi, Hinglish, Marathi, Gujarati, Tamil, English)
CATEGORY_KEYWORDS = {
    "Water Supply": [
        "water", "paani", "pani", "supply", "tanker", "pipeline", "peene", "jal", "tap",
        "पानी", "जल", "नल", "टैंकर", "पाणी", "પાણી", "નળ", "தண்ணீர்", "தண்ணி", "குடிநீர்"
    ],
    "Road": [
        "road", "sadak", "gaddha", "pothole", "street", "traffic", "gadde", "rasta", "bridge",
        "सड़क", "गड्ढा", "रास्ता", "गड्ढे", "रस्ता", "ખાળો", "રસ્તો", "சாலை", "தெரு", "ரோடு"
    ],
    "Health": [
        "health", "hospital", "clinic", "doctor", "bimari", "beemar", "ambulance", "dawai", "dawa",
        "अस्पताल", "डॉक्टर", "दवा", "बीमारी", "आरोग्य", "દવા", "હોસ્પિટલ", "மருத்துவமனை", "டாக்டர்", "மருந்து"
    ],
    "Electricity": [
        "electricity", "bijli", "light", "transformer", "power", "current", "wire", "pole",
        "बिजली", "लाइट", "ट्रांसफॉर्मर", "वीज", "વીજળી", "લાઇટ", "மின்சாரம்", "கரண்ட்", "லைட்"
    ],
    "Education": [
        "school", "shiksha", "teacher", "padhai", "college", "admission", "student", "books",
        "स्कूल", "शिक्षक", "पढ़ाई", "शिक्षा", "शाळा", "શાળા", "શિક્ષણ", "பள்ளி", "ஆசிரியர்", "படிப்பு"
    ],
    "Sanitation": [
        "garbage", "kachra", "safai", "sewage", "drain", "gutter", "toilet", "gandagi", "nalla",
        "कचरा", "सफाई", "नाली", "गटर", "गंदगी", "કચરો", "સફાઈ", "ગટર", "குப்பை", "சாக்கடை", "சுத்தம்"
    ],
}

# Multilingual Urgency indicator words
URGENCY_WORDS = [
    "urgent", "emergency", "bahut", "kaafi", "din se", "hafto se", "weeks",
    "months", "bachche", "children", "zaroori", "turant", "problem", "pareshani",
    "तुरंत", "जरूरी", "गंभीर", "खराब", "खूप", "तात्काळ", "ઝડપી", "અતિ", "અવશ્ય", "அவசரம்", "உடனடியாக", "ஆபத்து"
]


def classify_complaint(text: str) -> Dict[str, int]:
    """
    Classify complaint text using rule-based keyword matching.
    
    Args:
        text: Raw complaint text from citizen
        
    Returns:
        Dictionary with keys:
            - category: Classified category (string)
            - confidence: Confidence score 0-100 (int)
            - urgency: Urgency score 0-100 (int)
    """
    # Handle empty or whitespace-only strings
    if not text or not text.strip():
        logger.warning("Empty text provided to classify_complaint")
        return {
            "category": "General / Other",
            "confidence": 60,
            "urgency": 30
        }
    
    # Normalize text (lowercase, handle ALL CAPS, etc.)
    text_lower = text.lower().strip()
    
    # Count keyword matches for each category
    category_matches = {}
    for category, keywords in CATEGORY_KEYWORDS.items():
        match_count = sum(1 for keyword in keywords if keyword in text_lower)
        if match_count > 0:
            category_matches[category] = match_count
    
    # Determine category (highest match count)
    if category_matches:
        category = max(category_matches, key=category_matches.get)
        matches = category_matches[category]
    else:
        category = "General / Other"
        matches = 0
    
    # Calculate confidence score
    # Formula: min(97, 60 + matches * 14)
    # Clamp to 0-100 range
    confidence = min(100, max(0, min(97, 60 + matches * 14)))
    
    # Count urgency word hits
    urgency_hits = sum(1 for word in URGENCY_WORDS if word in text_lower)
    
    # Calculate urgency score
    # Formula: min(96, max(30, 38 + urgency_hits * 13 + (12 if Health else 0)))
    # Clamp to 0-100 range
    health_bonus = 12 if category == "Health" else 0
    urgency = min(100, max(0, min(96, max(30, 38 + urgency_hits * 13 + health_bonus))))
    
    return {
        "category": category,
        "confidence": confidence,
        "urgency": urgency
    }


# TODO: replace with NVIDIA NIM / Bhashini call
async def classify_complaint_ai(text: str) -> Dict[str, int]:
    """
    Classify complaint using NVIDIA NIM API (OpenAI-compatible endpoint).
    This is a stub implementation for future integration.
    
    To use:
    1. Set NVIDIA_API_KEY in .env
    2. Uncomment the implementation below
    3. Replace classify_complaint() calls with this function
    
    NVIDIA NIM uses OpenAI SDK format:
    - Base URL: https://integrate.api.nvidia.com/v1
    - Model: Use NVIDIA's multilingual model for Hindi+English support
    
    Args:
        text: Raw complaint text from citizen
        
    Returns:
        Dictionary with keys:
            - category: Classified category (string)
            - confidence: Confidence score 0-100 (int)
            - urgency: Urgency score 0-100 (int)
    """
    # from openai import AsyncOpenAI
    # from app.config import settings
    # 
    # client = AsyncOpenAI(
    #     api_key=settings.nvidia_api_key,
    #     base_url="https://integrate.api.nvidia.com/v1"
    # )
    # 
    # prompt = f"""Classify this citizen complaint into one of these categories:
    # Water Supply, Road, Health, Electricity, Education, Sanitation, General / Other
    # 
    # Also rate urgency from 0-100 and confidence from 0-100.
    # 
    # Complaint: {text}
    # 
    # Respond in JSON format:
    # {{"category": "...", "confidence": 85, "urgency": 70}}
    # """
    # 
    # response = await client.chat.completions.create(
    #     model="nvidia/multilingual-model-name",  # Replace with actual model
    #     messages=[{"role": "user", "content": prompt}],
    #     temperature=0.3,
    # )
    # 
    # # Parse JSON response
    # import json
    # result = json.loads(response.choices[0].message.content)
    # return result
    
    # Fallback to rule-based for now
    return classify_complaint(text)
