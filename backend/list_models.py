import requests
import os
from dotenv import load_dotenv

load_dotenv()
tts_key = os.getenv("NVIDIA_TTS_API_KEY")

res = requests.get(
    "https://integrate.api.nvidia.com/v1/models",
    headers={"Authorization": f"Bearer {tts_key}"}
)
data = res.json()
all_models = [m["id"] for m in data.get("data", [])]
print("All available models:")
for m in sorted(all_models):
    print(m)
