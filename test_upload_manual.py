import requests

BASE_URL = "http://127.0.0.1:8000"
HEADERS = {"Authorization": "Bearer mock-token"}

def test_upload():
    print("Testing /upload...")
    files = {"files": ("manual_test.txt", b"This is a manual test of the upload system.", "text/plain")}
    try:
        r = requests.post(f"{BASE_URL}/upload", headers=HEADERS, files=files)
        print(f"Status: {r.status_code}")
        # Validate JSON response
        try:
            data = r.json()
            print(f"Response JSON: {data}")
        except Exception:
            print(f"Response Text (Non-JSON): {r.text}")
    except Exception as e:
        print(f"Error connecting to server: {e}")

if __name__ == "__main__":
    test_upload()
