"""
document_loader.py
------------------
Reusable module for loading documents from PDF or TXT files.
Supports single file loading and batch loading from a directory.
"""

import os
from pathlib import Path
from typing import List

from langchain_community.document_loaders import PyPDFLoader, TextLoader, Docx2txtLoader
from langchain_core.documents import Document


SUPPORTED_EXTENSIONS = {".pdf", ".txt", ".docx"}


def load_document(file_path: str) -> List[Document]:
    """
    Load a single document from a PDF or TXT file.

    Args:
        file_path: Absolute or relative path to the document.

    Returns:
        A list of LangChain Document objects (one per page for PDFs).

    Raises:
        ValueError: If the file extension is not supported.
        FileNotFoundError: If the file does not exist.
    """
    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    ext = path.suffix.lower()
    if ext not in SUPPORTED_EXTENSIONS:
        raise ValueError(
            f"Unsupported file type '{ext}'. Supported types: {SUPPORTED_EXTENSIONS}"
        )

    if ext == ".pdf":
        loader = PyPDFLoader(str(path))
    elif ext == ".docx":
        loader = Docx2txtLoader(str(path))
    else:
        loader = TextLoader(str(path), encoding="utf-8")

    documents = loader.load()

    # Attach source metadata to every page/doc
    for doc in documents:
        doc.metadata["source_file"] = path.name
        doc.metadata["source_path"] = str(path.resolve())

    print(f"[DocumentLoader] Loaded {len(documents)} page(s) from '{path.name}'")
    return documents


def load_documents_from_directory(directory: str) -> List[Document]:
    """
    Recursively load all supported documents from a directory.

    Args:
        directory: Path to the directory to scan.

    Returns:
        A combined list of LangChain Document objects from all files found.
    """
    dir_path = Path(directory)
    if not dir_path.is_dir():
        raise NotADirectoryError(f"Not a directory: {directory}")

    all_documents: List[Document] = []
    found_files = [
        f for f in dir_path.rglob("*") if f.suffix.lower() in SUPPORTED_EXTENSIONS
    ]

    if not found_files:
        print(f"[DocumentLoader] No supported files found in '{directory}'")
        return all_documents

    for file_path in found_files:
        try:
            docs = load_document(str(file_path))
            all_documents.extend(docs)
        except Exception as e:
            print(f"[DocumentLoader] Warning: Could not load '{file_path.name}': {e}")

    print(
        f"[DocumentLoader] Total: {len(all_documents)} pages from "
        f"{len(found_files)} file(s) in '{directory}'"
    )
    return all_documents
