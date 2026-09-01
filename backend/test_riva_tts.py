import requests
import os
from dotenv import load_dotenv

load_dotenv()
tts_key = os.getenv("NVIDIA_TTS_API_KEY")

urls = [
    "https://ai.api.nvidia.com/v1/audio/nvidia/fastpitch-hifigan",
    "https://health.api.nvidia.com/v1/audio/nvidia/fastpitch-hifigan",
    "https://api.nvidia.com/v1/audio/tts",
    "https://integrate.api.nvidia.com/v1/audio/speech",
    "https://ai.api.nvidia.com/v1/tts/fastpitch",
]

for url in urls:
    try:
        r = requests.post(
            url,
            headers={
                "Authorization": f"Bearer {tts_key}",
                "Content-Type": "application/json"
            },
            json={"text": "Namaste"},
            timeout=5
        )
        print(f"{url} -> {r.status_code}: {r.text[:150]}")
    except Exception as e:
        print(f"{url} -> Error: {e}")
