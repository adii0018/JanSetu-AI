from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()
tts_key = os.getenv("NVIDIA_TTS_API_KEY")

client = OpenAI(
    base_url='https://integrate.api.nvidia.com/v1',
    api_key=tts_key
)

test_models = [
    "meta/llama-3.3-70b-instruct",
    "google/gemma-2-9b-it",
    "mistralai/mistral-7b-instruct-v0.3",
    "google/gemma-3-4b-it",
    "nvidia/mistral-nemo-minitron-8b-8k-instruct",
    "ibm/granite-3.0-8b-instruct"
]

for m in test_models:
    try:
        res = client.chat.completions.create(
            model=m,
            messages=[{"role": "user", "content": "Hello"}],
            max_tokens=10
        )
        print(f"SUCCESS with model {m}: {res.choices[0].message.content}")
        break
    except Exception as e:
        print(f"FAIL {m}: {e}")
