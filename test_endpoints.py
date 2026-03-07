import requests
import json
import traceback

BASE_URL = "http://localhost:8000"

def test_endpoints():
    print("Testing /flashcards...")
    try:
        res = requests.post(
            f"{BASE_URL}/flashcards",
            json={"topic": "React Native", "k": 3},
            headers={"Authorization": "Bearer mock-token"}
        )
        print(f"Status: {res.status_code}")
        print(res.text[:200])
    except Exception as e:
        print("Error:")
        traceback.print_exc()

    print("\nTesting /ask...")
    try:
        res = requests.post(
            f"{BASE_URL}/ask",
            json={"question": "What is React Native?", "k": 3},
            headers={"Authorization": "Bearer mock-token"}
        )
        print(f"Status: {res.status_code}")
        print(res.text[:200])
    except Exception as e:
        print("Error:")
        traceback.print_exc()

if __name__ == "__main__":
    test_endpoints()
