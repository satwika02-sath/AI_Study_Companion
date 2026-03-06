# rag/__init__.py
# Expose the public API of the RAG package.

from rag.rag_pipeline import (
    ingest_file, 
    ingest_uploaded_bytes, 
    query, 
    ask_tutor,
    generate_quiz,
    generate_flashcards,
    remove_document, 
    get_stats
)
from rag.repo_explainer import (
    clone_and_index_repo,
    explain_repo_architecture,
    query_repo
)

__all__ = [
    "ingest_file",
    "ingest_uploaded_bytes",
    "query",
    "ask_tutor",
    "generate_quiz",
    "generate_flashcards",
    "remove_document",
    "get_stats",
    "clone_and_index_repo",
    "explain_repo_architecture",
    "query_repo"
]
