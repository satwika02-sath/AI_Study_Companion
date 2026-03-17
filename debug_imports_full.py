import sys
import os
import importlib

print(f"Python: {sys.version}")
print(f"CWD: {os.getcwd()}")

modules_to_check = [
    "fastapi",
    "uvicorn",
    "python-multipart", # imported as multipart? No, usually not needed to import directly
    "pydantic",
    "dotenv", # python-dotenv
    "langchain",
    "langchain_community",
    "langchain_huggingface",
    "langchain_google_genai",
    "langchain_openai",
    "faiss", # faiss-cpu
    "pypdf",
    "pytesseract",
    "PIL", # Pillow
    "git", # GitPython
    "google.generativeai",
    "numpy",
    "pandas",
    "tqdm",
    "esprima",
    "firebase_admin", # The one we suspect is missing
]

for mod in modules_to_check:
    try:
        importlib.import_module(mod.replace("-", "_"))
        print(f"{mod}: OK")
    except ImportError as e:
        print(f"{mod}: FAIL ({e})")
    except Exception as e:
        print(f"{mod}: ERROR ({e})")

# Check local rag modules
rag_modules = [
    "rag.auth",
    "rag.rag_pipeline",
    "rag.embedding_generator",
    "rag.repo_explainer",
    "rag.vector_store",
    "rag.llm_engine",
    "rag.document_loader",
    "rag.text_splitter",
    "rag.ocr_engine",
    "rag.agents",
]

print("\nChecking local RAG modules:")
for mod in rag_modules:
    try:
        importlib.import_module(mod)
        print(f"{mod}: OK")
    except ImportError as e:
        print(f"{mod}: FAIL ({e})")
    except Exception as e:
        print(f"{mod}: ERROR ({e})")
