from pypdf import PdfReader
import os

PDF_FILE = r"c:\AI_Student_Companion\uploads\RadhaT_Resume.pdf"

def main():
    if not os.path.exists(PDF_FILE):
        print(f"File not found: {PDF_FILE}")
        return
    
    try:
        reader = PdfReader(PDF_FILE)
        number_of_pages = len(reader.pages)
        print(f"Successfully read {number_of_pages} pages from {os.path.basename(PDF_FILE)}")
        text = reader.pages[0].extract_text()
        print(f"Extracted {len(text)} characters from first page.")
    except Exception as e:
        print(f"Error reading PDF: {e}")

if __name__ == "__main__":
    main()
