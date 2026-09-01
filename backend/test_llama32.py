from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()
tts_key = os.getenv("NVIDIA_TTS_API_KEY")

client = OpenAI(
    base_url='https://integrate.api.nvidia.com/v1',
    api_key=tts_key
)

try:
    res = client.chat.completions.create(
        model="meta/llama-3.2-11b-vision-instruct",
        messages=[{"role": "user", "content": "Say 'Namaste, aapki shikayat darj ho gayi hai'"}],
        max_tokens=30
    )
    print("SUCCESS meta/llama-3.2-11b-vision-instruct with NVIDIA_TTS_API_KEY:")
    print(res.choices[0].message.content.encode('utf-8', errors='ignore').decode('utf-8'))
except Exception as e:
    print(f"FAIL: {e}")
