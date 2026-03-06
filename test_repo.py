"""
test_repo.py
------------
Smoke test for cloning and indexing.
"""
import os
import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).parent))

from rag.repo_explainer import clone_and_index_repo

# We'll use a small repo for testing, or just check if it fails gracefully
TEST_REPO = "https://github.com/octocat/Spoon-Knife"

def test():
    print("Testing repo cloning and indexing...")
    result = clone_and_index_repo(TEST_REPO)
    print(f"Result: {result}")
    
    if "status" in result and result["status"] == "success":
        print("✓ Successfully cloned and indexed repo.")
    else:
        print(f"✗ Failed: {result}")

if __name__ == "__main__":
    test()
