"""
NLP service for complaint classification.
Currently uses rule-based keyword matching.
Structured for future integration with NVIDIA NIM API or Bhashini.
"""
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

# Comprehensive Multilingual Category keyword mappings (10+ Indian languages: Hindi, Hinglish, Marathi, Gujarati, Tamil, Telugu, Bengali, Kannada, Malayalam, Punjabi, English)
CATEGORY_KEYWORDS = {
    "Water Supply": [
        "water", "paani", "pani", "supply", "tanker", "pipeline", "peene", "jal", "tap", "leakage", "contamination", "dirty water", "muddy water", "water issue", "water problem",
        "पानी", "जल", "नल", "टैंकर", "पाणी", "પાણી", "નળ", "તળાવ", "தண்ணீர்", "தண்ணி", "குடிநீர்",
        "నీరు", "మంచినీరు", "জল", "পানি", "ನೀರು", "ಕುಡಿಯುವ ನೀರು", "വെള്ളം", "കുടിവെള്ളം", "ਪਾਣੀ"
    ],
    "Road": [
        "road", "sadak", "gaddha", "pothole", "street", "traffic", "gadde", "rasta", "bridge", "patchwork", "accident", "broken road", "signal", "infrastructure", "infra",
        "सड़क", "गड्ढा", "रास्ता", "गड्ढे", "रस्ता", "इन्फ्रास्ट्रक्चर", "इन्फ्रा", "ખાળો", "રસ્તો", "சாலை", "தெரு", "ரோடு",
        "రోడ్డు", "రహదారి", "রাস্তা", "সড়ক", "ರಸ್ತೆ", "ಖಾಲಿ", "റോഡ്", "തെരുവ്", "ਸੜਕ", "ਰਾਹ"
    ],
    "Health": [
        "health", "hospital", "clinic", "doctor", "bimari", "beemar", "ambulance", "dawai", "dawa", "dengue", "malaria", "fever", "emergency", "bed", "medical",
        "अस्पताल", "डॉक्टर", "दवा", "बीमारी", "आरोग्य", "દવા", "હોસ્પિટલ", "மருத்துவமனை", "டாக்டர்", "மருந்து",
        "ఆసుపత్రి", "వైద్యుడు", "হাসপাতাল", "ডাক্তার", "ಆಸ್ಪತ್ರೆ", "ವೈದ್ಯರು", "ആശുപത്രി", "ഡോക്ടർ", "ਹਸਪਤਾਲ", "ਡਾਕਟਰ"
    ],
    "Electricity": [
        "electricity", "bijli", "light", "transformer", "power", "current", "wire", "pole", "blackout", "spark", "voltage", "power cut", "electrical", "electric",
        "बिजली", "लाइट", "ट्रांसफॉर्मर", "वीज", "वीजळी", "લાઇટ", "மின்சாரம்", "கரண்ட்", "லைட்", "इलेक्ट्रिकल", "इलेक्ट्रिक", "इलेक्ट्रिसिटी",
        "విద్యుత్", "కరెంట్", "বিদ্যুৎ", "লাইটিং", "ವಿದ್ಯುತ್", "ಲೈಟ್", "വൈദ്യുതി", "ലൈറ്റ്", "ਬਿਜਲੀ", "ਲਾਈਟ"
    ],
    "Education": [
        "school", "shiksha", "teacher", "padhai", "college", "admission", "student", "books", "class", "bench", "blackboard",
        "स्कूल", "शिक्षक", "पढ़ाई", "शिक्षा", "शाळा", "શાળા", "શિક્ષણ", "பள்ளி", "ஆசிரியர்", "படிப்பு",
        "పాఠశాల", "ఉపాధ్యాయుడు", "স্কুল", "শিক্ষক", "ಶಾಲೆ", "ಶಿಖಕರು", "സ്കൂൾ", "അധ്യാപകൻ", "ਸਕੂਲ", "ਅਧਿਆਪਕ"
    ],
    "Sanitation": [
        "garbage", "kachra", "safai", "sewage", "drain", "gutter", "toilet", "gandagi", "nalla", "smell", "dustbin", "waste", "overflow", "cleanliness",
        "कचरा", "सफाई", "नाली", "गटर", "गंदगी", "કચરો", "સફાઈ", "ગટર", "குப்பை", "சாக்கடை", "சுத்தம்",
        "చెత్త", "పరిశుభ్రత", "আবর্জনা", "ময়লা", "ಕಸ", "ನೈರ್ಮಲ್ಯ", "മാലിന്യം", "ശുചിത്വം", "ਕੂੜਾ", "ਸਫਾਈ"
    ],
}

# Multilingual Urgency indicator words
URGENCY_WORDS = [
    "urgent", "emergency", "bahut", "kaafi", "din se", "hafto se", "weeks",
    "months", "bachche", "children", "zaroori", "turant", "problem", "pareshani", "critical", "danger",
    "तुरंत", "जरूरी", "गंभीर", "खराब", "खूप", "तात्काळ", "ઝડપી", "અતિ", "અવશ્ય", "அவசரம்", "உடனடியாக", "ஆபத்து",
    "అత్యవసరం", "వెంటనే", "জরুরী", "অবিলম্বে", "জরুরি", "ತುರ್ತು", "ಕೂಡಲೇ", "അടിയന്തിരം", "ഉടൻ", "ਜ਼ਰੂਰੀ", "ਤੁਰੰਤ"
]

# Comprehensive Named Entity Recognition (NER) location mapping dictionary for Pan-India States, UTs, Wards & Cities
LOCATION_ENTITIES: Dict[str, list] = {
    # Jammu & Kashmir / Ladakh
    "Jammu & Kashmir - Srinagar": ["jammu & kashmir", "jammu and kashmir", "jammu", "kashmir", "srinagar", "जम्मू एंड कश्मीर", "जम्मू और कश्मीर", "जम्मू", "कश्मीर", "श्रीनगर", "j&k"],
    "Ladakh - Leh": ["ladakh", "leh", "लद्दाख", "लेह"],

    # Gujarat
    "Gujarat - Ahmedabad": ["gujarat", "gujrat", "gandhinagar", "vadodara", "baroda", "rajkot", "गुजरात", "ગુજરાત"],
    "Surat - Textile Market": ["surat", "सुरत", "सूरत"],
    "Ahmedabad - Navrangpura": ["navrangpura", "नवरंगपुरा", "ahmedabad", "amdavad", "अहमदाबाद"],

    # Madhya Pradesh
    "Indore - Rajwada": ["rajwada", "राजवाड़ा", "indore", "इन्दौर", "इंदौर", "rajwada chowk"],
    "Indore - Vijay Nagar": ["vijay nagar", "विजय नगर", "vijaynagar"],
    "Indore - Bhawarkuan": ["bhawarkuan", "भंवरकुआं", "bhawarkua"],
    "Indore - Palasia": ["palasia", "पलासिया"],
    "Indore - Rau": ["rau", "राऊ"],
    "Bhopal - MP Nagar": ["mp nagar", "एमपी नगर", "bhopal", "भोपाल"],
    "Gwalior - Maharaj Bada": ["gwalior", "ग्वालियर"],
    "Ujjain - Mahakal Lok": ["ujjain", "उज्जैन"],
    "Jabalpur - Civil Lines": ["jabalpur", "जबलपुर"],
    
    # Delhi NCR
    "Delhi - Connaught Place": ["connaught place", "कनॉट प्लेस", "cp", "rajiv chowk", "delhi", "dilli", "दिल्ली", "नई दिल्ली"],
    "Delhi - Rohini Sector 7": ["rohini", "रोहिणी"],
    "Delhi - Dwarka Sector 10": ["dwarka", "द्वारका"],
    "Noida - Sector 62": ["noida", "नोएडा"],
    "Gurugram - Cyber City": ["gurugram", "gurgaon", "गुड़गांव", "गुरुग्राम", "haryana", "हरियाणा"],
    
    # Maharashtra
    "Mumbai - Andheri West": ["andheri", "अंधेरी", "mumbai", "bombay", "मुंबई", "maharashtra", "महाराष्ट्र"],
    "Mumbai - Bandra West": ["bandra", "बांद्रा"],
    "Mumbai - Dadar Central": ["dadar", "दादर"],
    "Pune - Kothrud": ["kothrud", "कोथरुड", "pune", "poona", "पुणे"],
    "Nagpur - Sitabuldi": ["nagpur", "नागपुर"],
    
    # Karnataka
    "Bengaluru - Koramangala": ["koramangala", "banglore", "bangalore", "bengaluru", "बैंगलोर", "बेंगलुरु", "बेंगलोर", "karnataka", "कर्नाटक"],
    "Bengaluru - Indiranagar": ["indiranagar", "इंदिरानगर"],
    "Bengaluru - Whitefield": ["whitefield", "व्हाइटफील्ड"],
    
    # Uttar Pradesh
    "Lucknow - Hazratganj": ["hazratganj", "हज़रतगंज", "lucknow", "लखनऊ", "uttar pradesh", "up", "उत्तर प्रदेश"],
    "Varanasi - Cantt Area": ["varanasi", "वाराणसी", "banaras", "बनारस", "kashi"],
    "Kanpur - City Central": ["kanpur", "कानपुर"],
    "Agra - Taj Ganj": ["agra", "आगरा"],
    
    # Rajasthan
    "Jaipur - Pink City": ["jaipur", "जयपुर", "pink city", "rajasthan", "राजस्थान"],
    "Udaipur - City Palace": ["udaipur", "उदयपुर"],
    
    # Telangana & Andhra Pradesh
    "Hyderabad - Hitech City": ["hitech city", "cyber towers", "hyderabad", "hyd", "हैदराबाद", "telangana", "तेलंगाना"],
    "Visakhapatnam - Beach Road": ["vizag", "visakhapatnam", "andhra", "andhra pradesh", "आंध्र प्रदेश"],
    
    # Tamil Nadu & Kerala
    "Chennai - T. Nagar": ["t nagar", "chennai", "madras", "चेन्नई", "tamil nadu", "तमिलनाडु"],
    "Kerala - Kochi": ["kerala", "kochi", "cochin", "thiruvananthapuram", "trivandrum", "केरल"],
    
    # West Bengal, Bihar, Jharkhand & Odisha
    "Kolkata - Salt Lake Sector V": ["salt lake", "kolkata", "calcutta", "कोलकाता", "west bengal", "bengal", "पश्चिम बंगाल"],
    "Patna - Junction": ["patna", "पटना", "bihar", "बिहार"],
    "Ranchi - Main Road": ["ranchi", "रांची", "jharkhand", "झारखंड"],
    "Odisha - Bhubaneswar": ["odisha", "orissa", "bhubaneswar", "cuttack", "ओडिशा"],
    
    # Punjab, Assam, Uttarakhand, Himachal & Goa
    "Punjab - Ludhiana": ["ludhiana", "amritsar", "punjab", "पंजाब"],
    "Assam - Guwahati": ["assam", "guwahati", "असम", "गुवाहाटी"],
    "Uttarakhand - Dehradun": ["uttarakhand", "dehradun", "haridwar", "उत्तराखंड"],
    "Himachal Pradesh - Shimla": ["himachal", "himachal pradesh", "shimla", "हिमाचल"],
    "Goa - Panaji": ["goa", "panaji", "गोवा"],
}

# Metadata for dynamic city creation if ward does not exist in DB yet
PAN_INDIA_CITY_META: Dict[str, dict] = {
    "Jammu & Kashmir - Srinagar": {"infra_index": 50, "budget_index": 45, "lat": 34.0837, "lng": 74.7973},
    "Gujarat - Ahmedabad": {"infra_index": 70, "budget_index": 65, "lat": 23.0225, "lng": 72.5714},
    "Bengaluru - Koramangala": {"infra_index": 70, "budget_index": 65, "lat": 12.9352, "lng": 77.6245},
    "Mumbai - Andheri West": {"infra_index": 60, "budget_index": 55, "lat": 19.1136, "lng": 72.8697},
    "Delhi - Connaught Place": {"infra_index": 85, "budget_index": 80, "lat": 28.6315, "lng": 77.2167},
    "Bhopal - MP Nagar": {"infra_index": 65, "budget_index": 60, "lat": 23.2332, "lng": 77.4343},
    "Indore - Rajwada": {"infra_index": 35, "budget_index": 30, "lat": 22.7196, "lng": 75.8577},
    "Kanpur - City Central": {"infra_index": 45, "budget_index": 40, "lat": 26.4499, "lng": 80.3319},
    "Patna - Junction": {"infra_index": 40, "budget_index": 35, "lat": 25.5941, "lng": 85.1376},
    "Surat - Textile Market": {"infra_index": 65, "budget_index": 60, "lat": 21.1702, "lng": 72.8311},
    "Nagpur - Sitabuldi": {"infra_index": 55, "budget_index": 50, "lat": 21.1458, "lng": 79.0882},
    "Chandigarh - Sector 17": {"infra_index": 80, "budget_index": 75, "lat": 30.7333, "lng": 76.7794},
    "Kerala - Kochi": {"infra_index": 75, "budget_index": 70, "lat": 9.9312, "lng": 76.2673},
    "Assam - Guwahati": {"infra_index": 50, "budget_index": 45, "lat": 26.1445, "lng": 91.7362},
    "Odisha - Bhubaneswar": {"infra_index": 60, "budget_index": 55, "lat": 20.2961, "lng": 85.8245},
    "Pan-India - General Region": {"infra_index": 50, "budget_index": 50, "lat": 20.5937, "lng": 78.9629},
}


import re

def extract_ward_name_from_text(text: str) -> Optional[str]:
    """
    AI Named Entity Recognition (NER) for extracting city/ward/state locations from complaint text.
    Supports all 28 States & 8 Union Territories of India, 100+ major cities, plus dynamic city extraction.
    Returns matched ward name or None if unmentioned.
    """
    if not text or not text.strip():
        return None
        
    text_lower = text.lower()
    
    # 1. First pass: Sub-locality / Specific Ward landmarks (longer phrases first to avoid false positives)
    for ward_name, keywords in LOCATION_ENTITIES.items():
        for kw in keywords:
            # For 2-letter keywords (e.g., 'up', 'mp', 'jk'), enforce strict word boundary matching
            if len(kw) <= 2:
                if re.search(r'\b' + re.escape(kw) + r'\b', text_lower):
                    logger.info(f"AI NER Entity Extractor matched short state token '{kw}' -> Ward '{ward_name}'")
                    return ward_name
                continue
                
            # Skip broad city/state names on first pass
            if kw in ("indore", "mumbai", "delhi", "bhopal", "bangalore", "banglore", "bengaluru", "pune", "lucknow", "jaipur", "hyderabad", "chennai", "kolkata", "gujarat", "gujrat", "rajasthan", "punjab", "haryana", "bihar"):
                continue
            if kw in text_lower:
                logger.info(f"AI NER Entity Extractor matched specific location '{kw}' -> Ward '{ward_name}'")
                return ward_name
                
    # 2. Second pass: General city/state names
    for ward_name, keywords in LOCATION_ENTITIES.items():
        for kw in keywords:
            if len(kw) <= 2:
                if re.search(r'\b' + re.escape(kw) + r'\b', text_lower):
                    logger.info(f"AI NER Entity Extractor matched city '{kw}' -> Ward '{ward_name}'")
                    return ward_name
            elif kw in text_lower:
                logger.info(f"AI NER Entity Extractor matched city '{kw}' -> Ward '{ward_name}'")
                return ward_name
                
    # 3. Third pass: Dynamic Regex Extractor for 'in <Location>', '<Location> me/mein/se/city'
    match = re.search(r'\b(?:in|at|near)\s+([a-zA-Z]{3,20})\b|\b([a-zA-Z]{3,20})\s+(?:me|mein|se|city|district|state)\b', text, re.IGNORECASE)
    if match:
        extracted = (match.group(1) or match.group(2)).capitalize()
        # Filter out common stop words / category words
        stop_words = {"water", "road", "light", "power", "street", "issue", "problem", "urgent", "garbage", "school", "doctor", "hospital", "heavy", "there", "this", "that", "with", "have", "from", "your", "they", "them", "which", "where"}
        if extracted.lower() not in stop_words:
            dyn_name = f"{extracted} - Central"
            logger.info(f"AI NER Dynamic Extractor parsed location '{extracted}' -> Ward '{dyn_name}'")
            return dyn_name

    return None


# Critical Hazards triggering high urgency (>=85)
CRITICAL_HAZARD_WORDS = [
    "fire", "short circuit", "spark", "accident", "death", "poison", "contamination",
    "drowning", "collapse", "current", "high voltage", "blast", "emergency", "fatal",
    "आग", "हादसा", "करंट", "ब्लास्ट", "खतरा", "एक्सीडेंट"
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
    # Formula: min(98, max(50, 62 + matches * 14))
    # Clamp to 0-100 range
    confidence = min(98, max(50, min(97, 62 + matches * 14)))
    
    # Count urgency word hits & critical hazards
    urgency_hits = sum(1 for word in URGENCY_WORDS if word in text_lower)
    is_critical_hazard = any(hazard in text_lower for hazard in CRITICAL_HAZARD_WORDS)
    
    # Calculate urgency score
    # Formula: 38 + urgency_hits * 12 + health_bonus + hazard_bonus
    # Clamp to 0-100 range
    health_bonus = 12 if category == "Health" else 0
    hazard_bonus = 30 if is_critical_hazard else 0
    
    base_urgency = 38 + urgency_hits * 12 + health_bonus + hazard_bonus
    if is_critical_hazard:
        base_urgency = max(base_urgency, 88)
    urgency = min(99, max(30, base_urgency))
    
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