import requests
import time

BASE_URL = "http://127.0.0.1:8000"
HEADERS = {"Authorization": "Bearer mock-token"}

def test_health():
    print("Waiting for /health...")
    for _ in range(10):
        try:
            r = requests.get(f"{BASE_URL}/health")
            if r.status_code == 200:
                print("Health OK:", r.json())
                return
        except requests.exceptions.ConnectionError:
            pass
        time.sleep(1)
    raise Exception("Server not ready.")

def test_upload():
    print("Testing /upload...")
    files = {"files": ("test_doc.txt", b"Machine learning is a field of AI that involves training models on data.", "text/plain")}
    r = requests.post(f"{BASE_URL}/upload", headers=HEADERS, files=files)
    if r.status_code != 200:
        print("Upload failed:", r.text)
    r.raise_for_status()
    print("Upload OK:", r.json())

def test_query():
    print("Testing /query...")
    r = requests.post(f"{BASE_URL}/query", headers=HEADERS, json={"question": "What is machine learning?", "k": 2})
    r.raise_for_status()
    print("Query OK: Found", len(r.json().get("results", [])), "results.")

def test_ask():
    print("Testing /ask...")
    r = requests.post(f"{BASE_URL}/ask", headers=HEADERS, json={"question": "Explain machine learning briefly."})
    if r.status_code != 200: print("Ask failed:", r.text)
    r.raise_for_status()
    print("Ask OK! Explanation length:", len(r.json().get("explanation", "")))

def test_quiz():
    print("Testing /quiz...")
    r = requests.post(f"{BASE_URL}/quiz", headers=HEADERS, json={"topic": "machine learning"})
    r.raise_for_status()
    print("Quiz OK! Generated questions.")

def test_flashcards():
    print("Testing /flashcards...")
    r = requests.post(f"{BASE_URL}/flashcards", headers=HEADERS, json={"topic": "machine learning"})
    r.raise_for_status()
    print("Flashcards OK! Generated cards.")

if __name__ == "__main__":
    try:
        test_health()
        test_upload()
        time.sleep(1) # wait for async ingestion
        test_query()
        test_ask()
        test_quiz()
        test_flashcards()
        print("\nSUCCESS! All endpoints working correctly.")
    except Exception as e:
        print(f"\nFAILED! Error: {e}")
