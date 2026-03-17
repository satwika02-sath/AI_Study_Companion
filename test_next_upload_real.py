import requests
import os

NEXT_URL = "http://127.0.0.1:3000"
HEADERS = {"Authorization": "Bearer mock-token"}
PDF_FILE = r"c:\AI_Student_Companion\uploads\RadhaT_Resume.pdf"

def test_next_upload_real():
    if not os.path.exists(PDF_FILE):
        print(f"Error: {PDF_FILE} not found.")
        return

    print(f"Testing /api/upload (Next.js proxy) with {PDF_FILE}...")
    with open(PDF_FILE, "rb") as f:
        files = {"files": (os.path.basename(PDF_FILE), f, "application/pdf")}
        try:
            r = requests.post(f"{NEXT_URL}/api/upload", headers=HEADERS, files=files)
            print(f"Status: {r.status_code}")
            print(f"Response: {r.text}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    test_next_upload_real()
