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
    Includes a retry mechanism for transient SSL/Network errors (common on Windows).
    """
    token = res.credentials
    max_retries = 3
    last_error = None

    for attempt in range(max_retries):
        try:
            decoded_token = auth.verify_id_token(token)
            return User(
                uid=decoded_token.get("uid"),
                email=decoded_token.get("email"),
                name=decoded_token.get("name")
            )
        except Exception as e:
            last_error = e
            error_str = str(e).lower()
            # If it's a transient SSL/EOF error, we retry.
            if "unexpected_eof" in error_str or "eof occurred in violation of protocol" in error_str or "connection aborted" in error_str:
                print(f"[Auth] Transient SSL error on attempt {attempt + 1}/{max_retries}. Retrying...")
                import asyncio
                await asyncio.sleep(0.5 * (attempt + 1)) # Exponential backoff
                continue
            
            # For other errors (invalid token, expired), we raise immediately
            print(f"[Auth] Token verification failed: {e}")
            raise HTTPException(
                status_code=401,
                detail=f"Invalid or expired authentication token: {str(e)}"
            )

    # If we exhausted retries
    print(f"[Auth] Token verification failed after {max_retries} attempts: {last_error}")
    raise HTTPException(
        status_code=401,
        detail=f"Authentication failed due to persistent network/SSL issues: {str(last_error)}"
    )
