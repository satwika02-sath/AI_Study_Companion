import requests

NEXT_URL = "http://127.0.0.1:3000"
HEADERS = {"Authorization": "Bearer mock-token"}

def test_next_upload():
    print("Testing /api/upload (Next.js proxy)...")
    files = {"files": ("next_manual_test.txt", b"This is a manual test of the Next.js proxy upload.", "text/plain")}
    try:
        r = requests.post(f"{NEXT_URL}/api/upload", headers=HEADERS, files=files)
        print(f"Status: {r.status_code}")
        print(f"Response: {r.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_next_upload()
