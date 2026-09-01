import requests
import os
from dotenv import load_dotenv

load_dotenv()
tts_key = os.getenv("NVIDIA_TTS_API_KEY")

print("Checking models endpoint with NVIDIA_TTS_API_KEY:")
try:
    res = requests.get(
        "https://integrate.api.nvidia.com/v1/models",
        headers={"Authorization": f"Bearer {tts_key}"}
    )
    print(f"Status: {res.status_code}")
    if res.status_code == 200:
        data = res.json()
        models = [m["id"] for m in data.get("data", [])]
        print(f"Total models found: {len(models)}")
        tts_models = [m for m in models if "tts" in m.lower() or "audio" in m.lower() or "fastpitch" in m.lower() or "riva" in m.lower() or "parakeet" in m.lower() or "speech" in m.lower()]
        print(f"Audio/TTS related models: {tts_models}")
    else:
        print(res.text[:500])
except Exception as e:
    print(f"Error: {e}")
