from openai import OpenAI

client = OpenAI(
    base_url='https://integrate.api.nvidia.com/v1',
    api_key='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'
)

models = [
    'meta/llama-3.3-70b-instruct',
    'nvidia/llama-3.1-nemotron-70b-instruct',
    'google/gemma-2-9b-it',
    'mistralai/mistral-7b-instruct-v0.3'
]

for m in models:
    try:
        print(f"Trying model: {m}...")
        res = client.chat.completions.create(
            model=m,
            messages=[
                {'role': 'user', 'content': 'Classify this complaint: "Rajwada me paani nahi aa raha 10 din se". Return JSON with category, confidence (0-100), urgency (0-100).'}
            ],
            max_tokens=150
        )
        print(f"SUCCESS with {m}:\n{res.choices[0].message.content}\n")
        break
    except Exception as e:
        print(f"FAIL {m}: {e}\n")
