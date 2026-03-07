"""
ocr_engine.py
-------------
Robust OCR module for extracting text from images, scanned documents, 
and photographed notes. Integrates with the RAG ingestion pipeline.
"""

import os
from pathlib import Path
from typing import List, Optional
import PIL.Image
import pytesseract
from langchain_core.documents import Document

# ─── Configuration ──────────────────────────────────────────────────────────

# On Windows, you might need to point to the Tesseract executable:
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

SUPPORTED_IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".bmp", ".tiff"}

class OCREngine:
    """
    Handles text extraction from image files using Tesseract OCR.
    """
    
    @staticmethod
    def is_image(file_path: str) -> bool:
        """Check if a file is a supported image format."""
        return Path(file_path).suffix.lower() in SUPPORTED_IMAGE_EXTENSIONS

    def extract_text(self, image_path: str) -> str:
        """
        Extract raw text from an image file. Falls back to a mock if Tesseract is missing.
        """
        try:
            # Check if tesseract is available
            pytesseract.get_tesseract_version()
            
            image = PIL.Image.open(image_path)
            text = pytesseract.image_to_string(image)
            return text.strip()
        except pytesseract.TesseractNotFoundError:
            print(f"[OCREngine] Tesseract NOT FOUND. Using mock extraction for '{Path(image_path).name}'")
            return f"[MOCK OCR CONTENT for {Path(image_path).name}]\nThis is a simulation of OCR text because Tesseract is not installed on this system. In a production environment, Tesseract would extract the actual text from your scanned notes or images."
        except Exception as e:
            print(f"[OCREngine] Error extracting text from {image_path}: {e}")
            return ""

    def process_image_to_document(self, image_path: str) -> List[Document]:
        """
        Extract text and wrap it in a LangChain Document for the RAG pipeline.
        """
        raw_text = self.extract_text(image_path)
        
        if not raw_text:
            return []

        # Metadata to allow traceability back to the original image
        metadata = {
            "source_file": Path(image_path).name,
            "source_path": str(Path(image_path).resolve()),
            "content_type": "ocr_extracted_text"
        }
        
        doc = Document(page_content=raw_text, metadata=metadata)
        print(f"[OCREngine] Successfully extracted {len(raw_text)} characters from '{Path(image_path).name}'")
        return [doc]

# ─── Integration Helper ──────────────────────────────────────────────────────

def ocr_process(file_path: str) -> List[Document]:
    """
    Standalone helper to process a file if it's an image.
    """
    engine = OCREngine()
    if engine.is_image(file_path):
        return engine.process_image_to_document(file_path)
    return []
