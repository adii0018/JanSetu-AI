from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()
tts_key = os.getenv("NVIDIA_TTS_API_KEY") or os.getenv("NVIDIA_API_KEY")

client = OpenAI(
    base_url='https://integrate.api.nvidia.com/v1',
    api_key=tts_key
)

active_candidates = [
    "nv-mistralai/mistral-nemo-12b-instruct",
    "meta/llama-3.2-11b-vision-instruct",
    "mistralai/mistral-large-2-instruct",
    "nvidia/nemotron-4-340b-instruct",
    "ibm/granite-3.0-8b-instruct",
    "google/gemma-3-12b-it",
    "deepseek-ai/deepseek-coder-6.7b-instruct"
]

for m in active_candidates:
    try:
        res = client.chat.completions.create(
            model=m,
            messages=[{"role": "user", "content": "Say hello in Hindi"}],
            max_tokens=30
        )
        print(f"SUCCESS with {m}:\n{res.choices[0].message.content}\n")
    except Exception as e:
        print(f"FAIL {m}: {e}\n")
