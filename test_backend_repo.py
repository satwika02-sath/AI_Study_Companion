import requests

url = "http://localhost:8000/analyze_repo"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer mock-token"
}
payload = {
    "repo_url": "https://github.com/satwika02-sath/portfolio.git"
}

print(f"Sending request to {url} with repo_url: {payload['repo_url']}")
try:
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
