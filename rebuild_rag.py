import asyncio
import os
import shutil
from pathlib import Path
from rag.rag_pipeline import ingest_file

async def rebuild_rag():
    faiss_dir = "faiss_index"
    if os.path.exists(faiss_dir):
        print(f"Deleting existing vector index at {faiss_dir}...")
        try:
            shutil.rmtree(faiss_dir)
        except Exception as e:
            print(f"Failed to delete {faiss_dir}: {e}")

    uploads_dir = Path("uploads")
    if not uploads_dir.exists():
        print("No uploads directory found. Nothing to ingest.")
        return

    # Let's ingest files in the root of uploads (no user_id)
    # and files in subdirectories (with user_id)
    for root, dirs, files in os.walk(uploads_dir):
        # determine user_id based on relative path
        rel_path = Path(root).relative_to(uploads_dir)
        user_id = rel_path.parts[0] if len(rel_path.parts) > 0 else None

        for file in files:
            file_path = os.path.join(root, file)
            print(f"Ingesting {file_path} for user: {user_id}...")
            try:
                result = await ingest_file(file_path, user_id=user_id)
                print(f"Result: {result}")
            except Exception as e:
                print(f"Failed to ingest {file_path}: {e}")

if __name__ == "__main__":
    asyncio.run(rebuild_rag())
