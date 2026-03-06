"""
repo_explainer.py
-----------------
New module for cloning, indexing, and explaining GitHub repositories.

Frameworks: LangChain, GitPython, FAISS.
"""

import os
import shutil
import tempfile
from pathlib import Path
from typing import List, Optional

from git import Repo
from rag.utils import remove_readonly
from langchain_community.document_loaders.generic import GenericLoader
from langchain_community.document_loaders.parsers import LanguageParser
from langchain_text_splitters import Language, RecursiveCharacterTextSplitter

from rag.vector_store import add_documents, similarity_search
from rag.llm_engine import get_llm, TUTOR_PROMPT

# ── Defaults & Config ────────────────────────────────────────────────────────
REPO_DIR = Path("repo_temp")
REPO_VECTOR_DIR = "repo_index"

# ── Core Functions ───────────────────────────────────────────────────────────

def clone_and_index_repo(repo_url: str) -> dict:
    """
    1. Clone repository to a temporary directory.
    2. Load code files (.py, .js, .ts, .tsx, .md).
    3. Chunk and embed into a separate FAISS index.
    4. Provide metadata summary.
    """
    # Clean previous repo
    if REPO_DIR.exists():
        shutil.rmtree(REPO_DIR, onerror=remove_readonly)
    if os.path.exists(REPO_VECTOR_DIR):
        shutil.rmtree(REPO_VECTOR_DIR, onerror=remove_readonly)

    REPO_DIR.mkdir(parents=True, exist_ok=True)

    print(f"[RepoExplainer] Cloning: {repo_url} into {REPO_DIR}")
    try:
        Repo.clone_from(repo_url, REPO_DIR)
    except Exception as e:
        return {"error": f"Failed to clone repo: {str(e)}"}

    # Use LangChain to load code files
    # Note: LanguageParser handles code-specific splitting later
    # We use GenericLoader with LanguageParser for supported extensions
    try:
        loader = GenericLoader.from_path(
            REPO_DIR,
            glob="**/*",
            suffixes=[".py", ".js", ".ts", ".tsx", ".md", ".txt"],
            parser=LanguageParser()
        )
        documents = loader.load()
    except Exception as e:
        return {"error": f"Loading error: {str(e)}"}

    print(f"[RepoExplainer] Loaded {len(documents)} source files.")

    if not documents:
        return {"error": "No supported source files found in the repository."}

    # Split documents specifically for code
    # We use RecursiveCharacterTextSplitter with language hints for better context
    try:
        python_splitter = RecursiveCharacterTextSplitter.from_language(
            language=Language.PYTHON, chunk_size=2000, chunk_overlap=200
        )
        chunks = python_splitter.split_documents(documents)
    except Exception as e:
        # Fallback to shared splitting if language-specific fails
        from langchain_text_splitters import RecursiveCharacterTextSplitter as RCS
        splitter = RCS(chunk_size=1000, chunk_overlap=100)
        chunks = splitter.split_documents(documents)

    print(f"[RepoExplainer] Created {len(chunks)} chunks.")

    # Embed & Store in a separate index
    try:
        stored_count = add_documents(
            chunks,
            persist_directory=REPO_VECTOR_DIR
        )
    except Exception as e:
        return {"error": f"Indexing error: {str(e)}"}

    return {
        "repo_url": repo_url,
        "files_loaded": len(documents),
        "chunks_indexed": stored_count,
        "status": "success"
    }


def explain_repo_architecture(repo_url: str) -> dict:
    """
    Searches the repo index and generates an architectural summary.
    """
    # Retrieve top K chunks describing the project
    query = "architecture overview project summary core logic important files"
    results = similarity_search(query, k=10, persist_directory=REPO_VECTOR_DIR)

    if not results:
        return {"error": "Index empty. Please index the repo first."}

    context = "\n\n---\n\n".join([r.page_content for r in results])

    # The user's requested architecture prompt
    ARCHITECTURE_PROMPT = f"""
    Explain the architecture of this repository: {repo_url}
    Using the provided context from the codebase, provide:
    
    1. Project Summary: What is this project for?
    2. Important Files: List 5-10 key files and their roles.
    3. System Architecture: How do the components interact?

    Context from codebase:
    {context}
    
    Format the response clearly for a developer.
    """

    llm = get_llm(temperature=0.2)
    if not llm:
        return {"error": "LLM not configured (missing API keys)."}

    print(f"[RepoExplainer] Generating architectural explanation for {repo_url}")
    try:
        response = llm.invoke(ARCHITECTURE_PROMPT)
        return {
            "explanation": response.content if hasattr(response, 'content') else str(response),
            "repo_url": repo_url
        }
    except Exception as e:
        return {"error": f"LLM error: {str(e)}"}


def query_repo(question: str, k: int = 5) -> dict:
    """
    Perform a semantic search specifically on the repository index.
    """
    results = similarity_search(question, k=k, persist_directory=REPO_VECTOR_DIR)
    
    if not results:
        return {"error": "No repo indexed or no results found."}
        
    return {
        "question": question,
        "results": [
            {"content": r.page_content, "metadata": r.metadata} 
            for r in results
        ]
    }
