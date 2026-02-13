from fastapi import Header, HTTPException
from supabase_client import supabase_admin

async def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing token")

    parts = authorization.split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer" or not parts[1].strip():
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = parts[1].strip()

    try:
        user_response = supabase_admin.auth.get_user(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    if not user_response.user:
        raise HTTPException(status_code=401, detail="Invalid token")

    return user_response.user
