"""
test_rag_pipeline.py
--------------------
Smoke-test for the FAISS-based RAG pipeline.
"""

import os
import sys
import tempfile
import shutil
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).parent))

from rag.document_loader import load_document
from rag.text_splitter import split_documents
from rag.vector_store import (
    add_documents, 
    similarity_search, 
    delete_document, 
    get_collection_stats
)

# ─── Config ───────────────────────────────────────────────────────────────────
TEST_FAISS_DIR = "faiss_index_test"

SAMPLE_TEXT = """
Introduction to Machine Learning

Machine learning is a subset of artificial intelligence (AI) that enables
systems to learn and improve from experience without being explicitly programmed.
It focuses on developing computer programs that can access data and use it to
learn for themselves.

Types of Machine Learning:
1. Supervised Learning
2. Unsupervised Learning
3. Reinforcement Learning

Neural Networks and Deep Learning:
Deep learning is a subset of machine learning that uses neural networks with
many layers (deep networks). These networks are particularly effective at tasks
like image recognition and NLP.
"""

def separator(title: str):
    print(f"\n{'-'*60}")
    print(f"  {title}")
    print(f"{'-'*60}")

def test_pipeline():
    print("\n" + "="*60)
    print("  RAG Pipeline Smoke Test (FAISS)")
    print("="*60)

    # Clean previous tests
    if os.path.exists(TEST_FAISS_DIR):
        shutil.rmtree(TEST_FAISS_DIR)

    # 1. Create document
    separator("Step 1 – Create sample document")
    tmp_file = tempfile.NamedTemporaryFile(
        mode="w", suffix=".txt", delete=False, encoding="utf-8"
    )
    tmp_file.write(SAMPLE_TEXT)
    tmp_file.close()

    try:
        # 2. Load
        separator("Step 2 - Document Loader")
        documents = load_document(tmp_file.name)
        print(f"+ Loaded {len(documents)} page(s)")

        # 3. Split
        separator("Step 3 - Text Splitter")
        chunks = split_documents(documents)
        print(f"+ Produced {len(chunks)} chunk(s)")

        # 4. Store (FAISS)
        separator("Step 4 - Vector Store (FAISS)")
        stored = add_documents(
            chunks,
            persist_directory=TEST_FAISS_DIR,
        )
        print(f"+ Stored {stored} chunk(s) in '{TEST_FAISS_DIR}'")

        # 5. Similarity search
        separator("Step 5 - Similarity Search")
        query = "What is deep learning?"
        results = similarity_search(
            query,
            k=2,
            persist_directory=TEST_FAISS_DIR,
        )
        print(f"+ Query: '{query}'")
        for i, doc in enumerate(results, 1):
            print(f"  Result {i}: {doc.page_content[:100]}...")

        # 6. Stats
        separator("Step 6 - Collection Stats")
        stats = get_collection_stats(persist_directory=TEST_FAISS_DIR)
        print(f"+ Stats: {stats}")

        # 7. Cleanup
        separator("Step 7 - Cleanup Index")
        delete_document(
            source_file=Path(tmp_file.name).name,
            persist_directory=TEST_FAISS_DIR,
        )
        
        print("\n" + "="*60)
        print("  DONE - FAISS RAG TEST PASSED")
        print("="*60 + "\n")

    finally:
        if os.path.exists(tmp_file.name):
            os.unlink(tmp_file.name)
        if os.path.exists(TEST_FAISS_DIR):
             shutil.rmtree(TEST_FAISS_DIR)

if __name__ == "__main__":
    test_pipeline()
