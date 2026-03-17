import requests

BASE_URL = "http://127.0.0.1:8000"
HEADERS = {"Authorization": "Bearer mock-token"}

def test_image_upload():
    print("Testing image upload (simulating failure if tesseract missing)...")
    # We use a dummy image name but it will be handled as an image by suffix
    files = {"files": ("test_image.png", b"fake-image-bytes", "image/png")}
    try:
        r = requests.post(f"{BASE_URL}/upload", headers=HEADERS, files=files)
        print(f"Status: {r.status_code}")
        print(f"Response: {r.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_image_upload()
