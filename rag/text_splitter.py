"""
text_splitter.py
----------------
Reusable module for splitting LangChain Documents into smaller, 
overlapping chunks for embedding and retrieval.

Configuration:
    chunk_size:    500 characters per chunk
    chunk_overlap: 100 characters of overlap between consecutive chunks
"""

from typing import List

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

# ---------------------------------------------------------------------------
# Default chunking configuration
# ---------------------------------------------------------------------------
DEFAULT_CHUNK_SIZE = 500
DEFAULT_CHUNK_OVERLAP = 100


def get_text_splitter(
    chunk_size: int = DEFAULT_CHUNK_SIZE,
    chunk_overlap: int = DEFAULT_CHUNK_OVERLAP,
) -> RecursiveCharacterTextSplitter:
    """
    Build and return a configured RecursiveCharacterTextSplitter.

    The splitter first tries to split on paragraph boundaries (\n\n), then
    on newlines, then on sentences, and finally on raw characters – this
    preserves semantic coherence as much as possible.

    Args:
        chunk_size:    Maximum number of characters per chunk (default 500).
        chunk_overlap: Number of characters shared between adjacent chunks (default 100).

    Returns:
        A ready-to-use RecursiveCharacterTextSplitter instance.
    """
    return RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""],
    )


def split_documents(
    documents: List[Document],
    chunk_size: int = DEFAULT_CHUNK_SIZE,
    chunk_overlap: int = DEFAULT_CHUNK_OVERLAP,
) -> List[Document]:
    """
    Split a list of LangChain Documents into smaller chunks.

    Original metadata (source_file, source_path, page, etc.) is preserved on
    every child chunk so the retriever can always trace back to the origin.

    Args:
        documents:     Raw documents returned by the document loader.
        chunk_size:    Maximum characters per chunk (default 500).
        chunk_overlap: Overlap characters between chunks (default 100).

    Returns:
        A list of chunked Document objects ready for embedding.
    """
    if not documents:
        print("[TextSplitter] No documents provided – returning empty list.")
        return []

    splitter = get_text_splitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    chunks = splitter.split_documents(documents)

    # Tag each chunk with its position index for debugging / traceability
    for idx, chunk in enumerate(chunks):
        chunk.metadata["chunk_index"] = idx

    print(
        f"[TextSplitter] Split {len(documents)} document(s) → "
        f"{len(chunks)} chunk(s) "
        f"(size={chunk_size}, overlap={chunk_overlap})"
    )
    return chunks
