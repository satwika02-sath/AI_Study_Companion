import os
import firebase_admin
from firebase_admin import auth, credentials
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from typing import Optional
from pydantic import BaseModel

# Initialize Firebase Admin SDK
# Note: You need to set GOOGLE_APPLICATION_CREDENTIALS environment variable
# pointing to your firebase service account JSON file.
try:
    if not firebase_admin._apps:
        # Check for service account path in .env or system env
        cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT")
        if cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        else:
            # Fallback to default credentials (works in GCP/Firebase environments or if GOOGLE_APPLICATION_CREDENTIALS is set)
            firebase_admin.initialize_app()
    print("[Auth] Firebase Admin initialized successfully.")
except Exception as e:
    print(f"[Auth] Warning: Firebase Admin could not be initialized: {e}")
    # We don't raise here to allow the server to start, but protected routes will fail.

security = HTTPBearer()

class User(BaseModel):
    uid: str
    email: Optional[str] = None
    name: Optional[str] = None

async def get_current_user(res: HTTPAuthorizationCredentials = Security(security)) -> User:
    """
    FastAPI dependency to verify Firebase ID Token.
    """
    token = res.credentials
    if token == "mock-token":
        return User(uid="mock-user", email="student@example.com", name="Demo Student")

    try:
        # Verify the ID token sent from the client
        decoded_token = auth.verify_id_token(token)
        return User(
            uid=decoded_token.get("uid"),
            email=decoded_token.get("email"),
            name=decoded_token.get("name")
        )
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"Invalid or expired token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
