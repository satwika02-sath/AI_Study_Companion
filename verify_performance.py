import time
import requests
import json
import os

BASE_URL = "http://localhost:8000"

def test_endpoint_timings():
    # Health check
    try:
        res = requests.get(f"{BASE_URL}/health")
        print(f"Health check: {res.status_code}")
    except Exception as e:
        print(f"Server not running at {BASE_URL}. Start it with 'python server.py'")
        return

    # Note: We can't easily test authenticated endpoints without a real Firebase token
    # but we can check if the response is fast (even if it's 401/403)
    
    endpoints = [
        ("/health", "GET"),
        # Add more if public
    ]
    
    for path, method in endpoints:
        start = time.time()
        if method == "GET":
            requests.get(f"{BASE_URL}{path}")
        else:
            requests.post(f"{BASE_URL}{path}", json={})
        end = time.time()
        print(f"{method} {path} took {end - start:.4f} seconds")

if __name__ == "__main__":
    test_endpoint_timings()
