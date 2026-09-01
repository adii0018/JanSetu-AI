from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()
tts_key = os.getenv("NVIDIA_TTS_API_KEY")

client = OpenAI(
    base_url='https://integrate.api.nvidia.com/v1',
    api_key=tts_key
)

for m in ["meta/llama-3.2-90b-vision-instruct", "meta/llama-3.2-11b-vision-instruct", "nvidia/riva-translate-4b-instruct"]:
    try:
        res = client.chat.completions.create(
            model=m,
            messages=[{"role": "user", "content": "Text to Speech voice prompt test"}],
            max_tokens=20
        )
        print(f"SUCCESS {m}")
    except Exception as e:
        print(f"FAIL {m}: {e}")
