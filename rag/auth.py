import os
import json
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from typing import Optional
from pydantic import BaseModel

class User(BaseModel):
    uid: str
    email: Optional[str] = None
    name: Optional[str] = None

# ---------------------------------------------------------------------------
# Deployment Helper: Write Firebase Service Account JSON from Environment Variable
# ---------------------------------------------------------------------------
firebase_json_env = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
firebase_json_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", "firebase-service-account.json")

if firebase_json_env and not os.path.exists(firebase_json_path):
    print(f"[Auth] Detected FIREBASE_SERVICE_ACCOUNT_JSON. Writing to {firebase_json_path}...")
    try:
        # Ensure it's valid JSON
        json_data = json.loads(firebase_json_env)
        with open(firebase_json_path, "w") as f:
            json.dump(json_data, f)
        print("[Auth] Successfully wrote Firebase Service Account file.")
    except Exception as e:
        print(f"[Auth] Error writing Firebase Service Account file: {e}")

# ---------------------------------------------------------------------------
# Initialize Firebase Admin
# ---------------------------------------------------------------------------
try:
    if not firebase_admin._apps:
        if os.path.exists(firebase_json_path):
            cred = credentials.Certificate(firebase_json_path)
            firebase_admin.initialize_app(cred)
            print(f"[Auth] Firebase Admin initialized with {firebase_json_path}")
        else:
            # Fallback to default or environment variables if any
            firebase_admin.initialize_app()
            print("[Auth] Firebase Admin initialized with default credentials")
except Exception as e:
    print(f"[Auth] Warning: Firebase Admin initialization failed: {e}")

security = HTTPBearer()

async def get_current_user(res: HTTPAuthorizationCredentials = Security(security)) -> User:
    """
    Verifies the Firebase ID token and returns the user object.
    """
    token = res.credentials
    try:
        decoded_token = auth.verify_id_token(token)
        return User(
            uid=decoded_token.get("uid"),
            email=decoded_token.get("email"),
            name=decoded_token.get("name")
        )
    except Exception as e:
        print(f"[Auth] Token verification failed: {e}")
        raise HTTPException(
            status_code=401,
            detail=f"Invalid or expired authentication token: {str(e)}"
        )
