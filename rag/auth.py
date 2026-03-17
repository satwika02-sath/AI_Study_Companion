import os
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

# Initialize Firebase Admin
# It's better to do this once. We'll look for the service account file.
# If not found, we'll try to initialize with default credentials.
try:
    if not firebase_admin._apps:
        # Default to firebase-service-account.json in the root if not specified
        cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", "firebase-service-account.json")
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            print(f"[Auth] Firebase Admin initialized with {cred_path}")
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
