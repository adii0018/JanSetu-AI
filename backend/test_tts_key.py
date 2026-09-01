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
        model="nvidia/llama-3.1-nemotron-70b-instruct",
        messages=[
            {"role": "system", "content": "You are JanConnect AI Voice Assistant. Convert the complaint update into clear, spoken Hindi for Text-To-Speech synthesis."},
            {"role": "user", "content": "Complaint #102: Water supply restored at Rajwada area. Priority: High."}
        ],
        max_tokens=100
    )
    print("NVIDIA_TTS_API_KEY Chat Response:")
    print(res.choices[0].message.content)
except Exception as e:
    print(f"Error: {e}")
