from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from app.core.config import JWT_SECRET, JWT_ALG, ACCESS_TOKEN_EXPIRE_MINUTES
from fastapi import HTTPException

def create_access_token(user_id: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": user_id, "exp": exp}, JWT_SECRET, algorithm=JWT_ALG)

def decode_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])

def create_password_reset_token(email: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(minutes=30)
    payload = {
        "sub": email,
        "exp": exp,
        "type": "password_reset",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def verify_password_reset_token(token: str) -> str:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])

        if payload.get("type") != "password_reset":
            raise HTTPException(status_code=400, detail="Invalid reset token")

        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=400, detail="Invalid reset token")

        return email

    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")