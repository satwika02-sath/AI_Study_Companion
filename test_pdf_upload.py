import requests

BASE_URL = "http://127.0.0.1:8000"
HEADERS = {"Authorization": "Bearer mock-token"}

def test_pdf_upload():
    print("Testing PDF upload...")
    # Create a dummy PDF file content (very simple)
    # A minimal PDF header
    pdf_content = b"%PDF-1.4\n1 0 obj < < /Type /Catalog /Pages 2 0 R > > endobj\n2 0 obj < < /Type /Pages /Kids [3 0 R] /Count 1 > > endobj\n3 0 obj < < /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R > > endobj\n4 0 obj < < /Length 44 > > stream\nBT /F1 24 Tf 100 700 Td (Hello PDF World) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000062 00000 n\n0000000124 00000 n\n0000000216 00000 n\ntrailer < < /Size 5 /Root 1 0 R > >\nstartxref\n310\n%%EOF"
    
    files = {"files": ("test_doc.pdf", pdf_content, "application/pdf")}
    try:
        r = requests.post(f"{BASE_URL}/upload", headers=HEADERS, files=files)
        print(f"Status: {r.status_code}")
        print(f"Response: {r.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_pdf_upload()
