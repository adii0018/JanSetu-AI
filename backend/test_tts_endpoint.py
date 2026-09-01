from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_tts_endpoints():
    print("Testing /api/v1/tts/status ...")
    res_status = client.get("/api/v1/tts/status")
    print(f"Status response ({res_status.status_code}):", res_status.json())
    assert res_status.status_code == 200

    print("\nTesting /api/v1/tts/synthesize (Hindi) ...")
    res_hi = client.post(
        "/api/v1/tts/synthesize",
        json={"text": "Rajwada kshetra me paani ki samasya hai.", "language": "hi-IN"}
    )
    print(f"Hindi response ({res_hi.status_code}):", res_hi.json())
    assert res_hi.status_code == 200

    print("\nTesting /api/v1/tts/synthesize (English) ...")
    res_en = client.post(
        "/api/v1/tts/synthesize",
        json={"text": "Water pipeline leak near Rajwada market.", "language": "en-IN"}
    )
    print(f"English response ({res_en.status_code}):", res_en.json())
    assert res_en.status_code == 200

    print("\nALL BACKEND TTS TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_tts_endpoints()
