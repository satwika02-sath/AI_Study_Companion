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
from rag.llm_engine import get_llm, TUTOR_PROMPT, with_retry

# ── Defaults & Config ────────────────────────────────────────────────────────
REPO_DIR = Path("repo_temp")
REPO_VECTOR_DIR = "repo_index"

# ── Core Functions ───────────────────────────────────────────────────────────

def clone_and_index_repo(repo_url: str, user_id: Optional[str] = None) -> dict:
    """
    1. Clone repository to a temporary directory.
    2. Load code files (.py, .js, .ts, .tsx, .md).
    3. Chunk and embed into a separate FAISS index.
    4. Provide metadata summary.
    """
    user_repo_dir = REPO_DIR / user_id if user_id else REPO_DIR

    # Clean previous repo
    if user_repo_dir.exists():
        shutil.rmtree(user_repo_dir, onerror=remove_readonly)
    # The vector store functions handle user isolation via REPO_VECTOR_DIR + user_id
    # We clean the user-specific vector store folder manually here for a fresh start
    actual_vector_dir = os.path.join(REPO_VECTOR_DIR, user_id) if user_id else REPO_VECTOR_DIR
    if os.path.exists(actual_vector_dir):
        shutil.rmtree(actual_vector_dir, onerror=remove_readonly)

    user_repo_dir.mkdir(parents=True, exist_ok=True)

    print(f"[RepoExplainer] Cloning (Shallow): {repo_url} into {user_repo_dir}")
    try:
        Repo.clone_from(repo_url, user_repo_dir, depth=1)
    except Exception as e:
        return {"error": f"Failed to clone repo: {str(e)}"}

    # Use LangChain to load code files
    try:
        # Specifically filter out log files and build artifacts to keep semantic search relevant
        loader = GenericLoader.from_filesystem(
            user_repo_dir,
            glob="**/*",
            suffixes=[".py", ".js", ".ts", ".tsx", ".md", ".txt"],
            exclude=["**/flutter_verbose.txt", "**/*.log", "**/build/*", "**/node_modules/*", "**/.git/*"],
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
            persist_directory=REPO_VECTOR_DIR,
            user_id=user_id
        )
    except Exception as e:
        return {"error": f"Indexing error: {str(e)}"}

    return {
        "repo_url": repo_url,
        "files_loaded": len(documents),
        "chunks_indexed": stored_count,
        "status": "success"
    }


from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field

class RepoAnalysisResponse(BaseModel):
    summary: str = Field(description="A brief summary of what the project is for.")
    important_files: List[str] = Field(description="A list of 5-10 key files and their roles.")
    architecture: str = Field(description="Detailed explanation of the system architecture and component interactions in Markdown.")

@with_retry(max_retries=2)
async def explain_repo_architecture(repo_url: str, user_id: Optional[str] = None) -> dict:
    """
    Searches the repo index and generates a structured architectural summary.
    """
    # Retrieve top K chunks describing the project
    query = "architecture overview project summary core logic important files"
    results = similarity_search(query, k=15, persist_directory=REPO_VECTOR_DIR, user_id=user_id)

    if not results:
        return {"error": "Index empty. Please index the repo first."}

    context = "\n\n---\n\n".join([r.page_content for r in results])
    
    # Efficiently get stats instead of searching for 10000 items
    from rag.vector_store import get_collection_stats
    stats = get_collection_stats(persist_directory=REPO_VECTOR_DIR, user_id=user_id)
    indexed_chunks = stats.get("total_chunks", 0)

    # The user's requested architecture prompt
    ARCHITECTURE_PROMPT = f"""
    Analyze the following repository: {repo_url}
    
    You are a Senior System Architect. Using the provided codebase context, generate a professional, structured Architectural Report in Markdown.
    
    Focus on:
    1. **High-Level Overview**: What is the core purpose of this project? What is its primary technology stack?
    2. **Structural Breakdown**: Describe the folder hierarchy and the responsibility of each major directory.
    3. **Core Components**: Identify 3-5 critical files/modules and explain how they function.
    4. **Data Flow**: How do different parts of the system interact (e.g., how data moves from input to processing)?
    5. **Architecture & Patterns**: Identify any design patterns (e.g., MVC, RAG, Middleware) or architectural styles used.
    
    Context from codebase:
    {context}
    
    Return the response in valid JSON format with EXACTLY these keys:
    1. summary (string: brief 2-sentence elevator pitch)
    2. important_files (list: 5-8 key file paths with 1-sentence role descriptions)
    3. architecture (string: the full detailed Markdown report)
    """

    llm = get_llm(temperature=0.1)
    if not llm:
        from rag.llm_engine import MOCK_RESPONSES
        repo_name = repo_url.split('/')[-1]
        return {
            "architecture": MOCK_RESPONSES["repo_architecture"].format(repo_name=repo_name),
            "summary": "This project is a sophisticated AI-integrated workspace facilitating note-taking, quiz generation, and repository analysis.",
            "important_files": ["server.py", "package.json", "rag/rag_pipeline.py", "rag/llm_engine.py", "next.config.js"],
            "repo_url": repo_url,
            "indexed_chunks": indexed_chunks
        }

    print(f"[RepoExplainer] Generating architectural explanation for {repo_url}")
    try:
        parser = JsonOutputParser(pydantic_object=RepoAnalysisResponse)
        response = await llm.ainvoke(ARCHITECTURE_PROMPT)
        
        # Robust parsing
        content = str(response.content) if hasattr(response, 'content') else str(response)
        # Attempt to parse as JSON
        import json
        try:
            # Strip markdown code blocks if present
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            data = json.loads(content)
        except:
            # Fallback if LLM fails JSON
            return {
                "summary": "Analysis completed.",
                "important_files": ["Check the architecture report for details."],
                "architecture": content,
                "repo_url": repo_url,
                "indexed_chunks": indexed_chunks
            }

        return {
            "summary": data.get("summary", "N/A"),
            "important_files": data.get("important_files", []),
            "architecture": data.get("architecture", content),
            "repo_url": repo_url,
            "indexed_chunks": indexed_chunks
        }
    except Exception as e:
        print(f"[RepoExplainer] LLM Error: {str(e)}")
        raise e


def query_repo(question: str, k: int = 5, user_id: Optional[str] = None) -> dict:
    """
    Perform a semantic search specifically on the repository index.
    """
    results = similarity_search(question, k=k, persist_directory=REPO_VECTOR_DIR, user_id=user_id)
    
    if not results:
        return {"error": "No repo indexed or no results found."}
        
    return {
        "question": question,
        "results": [
            {"content": r.page_content, "metadata": r.metadata} 
            for r in results
        ]
    }
