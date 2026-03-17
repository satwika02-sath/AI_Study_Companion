import sys
import os

print(f"Python: {sys.version}")
print(f"CWD: {os.getcwd()}")

try:
    import fastapi
    print("fastapi: OK")
except ImportError as e:
    print(f"fastapi: FAIL ({e})")

try:
    import uvicorn
    print("uvicorn: OK")
except ImportError as e:
    print(f"uvicorn: FAIL ({e})")

try:
    from rag.auth import get_current_user, User
    print("rag.auth: OK")
except ImportError as e:
    print(f"rag.auth: FAIL ({e})")
except Exception as e:
    print(f"rag.auth: ERROR ({e})")

try:
    from rag.rag_pipeline import ingest_uploaded_bytes
    print("rag.rag_pipeline: OK")
except ImportError as e:
    print(f"rag.rag_pipeline: FAIL ({e})")
except Exception as e:
    print(f"rag.rag_pipeline: ERROR ({e})")

try:
    from rag.embedding_generator import get_embedding_model
    print("rag.embedding_generator: OK")
except ImportError as e:
    print(f"rag.embedding_generator: FAIL ({e})")
except Exception as e:
    print(f"rag.embedding_generator: ERROR ({e})")

try:
    from rag.repo_explainer import clone_and_index_repo
    print("rag.repo_explainer: OK")
except ImportError as e:
    print(f"rag.repo_explainer: FAIL ({e})")
except Exception as e:
    print(f"rag.repo_explainer: ERROR ({e})")
