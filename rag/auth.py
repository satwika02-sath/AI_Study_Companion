import os
from typing import Optional
from pydantic import BaseModel

class User(BaseModel):
    uid: str
    email: Optional[str] = None
    name: Optional[str] = None

# We've removed Firebase Authentication to allow open local usage.
# Everyone accessing the app assumes the identity below.
async def get_current_user() -> User:
    """
    Returns a unified local user profile, bypassing authentication.
    """
    return User(
        uid="local-user", 
        email="student@example.com", 
        name="Demo Student"
    )
