from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

keys = {
    "MAIN_KEY": os.getenv("NVIDIA_API_KEY"),
    "ASR_KEY": os.getenv("NVIDIA_ASR_API_KEY"),
    "TTS_KEY": os.getenv("NVIDIA_TTS_API_KEY")
}

models = [
    "deepseek-ai/deepseek-r1",
    "meta/llama-3.3-70b-instruct",
    "nvidia/llama-3.1-nemotron-70b-instruct",
    "google/gemma-2-9b-it",
    "mistralai/mistral-7b-instruct-v0.3"
]

for name, k in keys.items():
    print(f"\n=== Testing Key: {name} ({k[:12] if k else None}) ===")
    client = OpenAI(
        base_url='https://integrate.api.nvidia.com/v1',
        api_key=k
    )
    for m in models:
        try:
            res = client.chat.completions.create(
                model=m,
                messages=[{"role": "user", "content": "Hi"}],
                max_tokens=10
            )
            print(f"SUCCESS with {m}: {res.choices[0].message.content.strip()}")
            break
        except Exception as e:
            print(f"FAIL {m}: {e}")
