import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

tts_key = os.getenv("NVIDIA_TTS_API_KEY")
print(f"Loaded TTS API Key: {tts_key[:12]}..." if tts_key else "No key found")

# Test common NVIDIA TTS endpoints or audio synthesis endpoints
endpoints_to_test = [
    {
        "url": "https://ai.api.nvidia.com/v1/audio/nvidia/fastpitch-hifigan",
        "headers": {
            "Authorization": f"Bearer {tts_key}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        "payload": {
            "text": "Aapki shikayat darj kar li gayi hai.",
            "language": "hi-IN"
        }
    },
    {
        "url": "https://integrate.api.nvidia.com/v1/audio/speech",
        "headers": {
            "Authorization": f"Bearer {tts_key}",
            "Content-Type": "application/json"
        },
        "payload": {
            "model": "tts-1",
            "input": "Aapki shikayat darj kar li gayi hai.",
            "voice": "alloy"
        }
    },
    {
        "url": "https://ai.api.nvidia.com/v1/audio/tts",
        "headers": {
            "Authorization": f"Bearer {tts_key}",
            "Content-Type": "application/json"
        },
        "payload": {
            "text": "Aapki shikayat darj kar li gayi hai."
        }
    }
]

for ep in endpoints_to_test:
    print(f"\n--- Testing: {ep['url']} ---")
    try:
        res = requests.post(ep["url"], headers=ep["headers"], json=ep["payload"], timeout=10)
        print(f"Status: {res.status_code}")
        print(f"Response snippet: {res.text[:300]}")
    except Exception as e:
        print(f"Error: {e}")
