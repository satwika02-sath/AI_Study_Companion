import os
from git import Repo
from pathlib import Path

REPO_URL = "https://github.com/satwika02-sath/portfolio.git"
DEST_DIR = Path("tmp_debug_clone")

if DEST_DIR.exists():
    import shutil
    shutil.rmtree(DEST_DIR)

print(f"Testing clone of {REPO_URL} into {DEST_DIR}...")
try:
    Repo.clone_from(REPO_URL, DEST_DIR, depth=1)
    print("SUCCESS: Clone completed normally.")
except Exception as e:
    print(f"FAILURE: {str(e)}")
