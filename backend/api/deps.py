from typing import Optional, Dict
from fastapi import Header, HTTPException, status

# Simple stub auth: extract bearer token if provided, otherwise allow anonymous client

def get_current_user(authorization: Optional[str] = Header(default=None)) -> Dict:
    if not authorization:
        return {"user_id": "anon", "role": "client"}
    token = authorization.replace("Bearer", "").strip()
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    # Token parsing stub: encode role in token like role:banker
    role = "banker" if "banker" in token else "client"
    return {"user_id": "user-token", "role": role}
