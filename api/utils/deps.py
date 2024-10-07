from utils.database import SessionLocal
from typing import Annotated, Optional
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer
from utils.models import User as UserModel
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from datetime import datetime
from utils.jwt_bearer import JWTBearer

# ---------------- Load Environment ----------------- #
load_dotenv()
SECRET_KEY = os.getenv('AUTH_SECRET_KEY')
ALGORITHM = os.getenv('AUTH_ALGORITHM')

# ---------------- Pydantic models ------------------ #
class TokenData(BaseModel):
    email: Optional[str] = None

class AuthUser(BaseModel):
    user_id: Optional[int] = None
    username: str
    email: Optional[str] = None
    created_at: Optional[datetime] = None
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None

    class Config:
        from_attributes = True

# ------------------ Get Database Dependency -------------------- #
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

# -------------------- JWTBearer -------------------- #
jwt_bearer = JWTBearer()

# -------------------- Get Current User ---------------------- #
async def get_current_user(
    token: Annotated[str, Depends(jwt_bearer)],  # Ensure jwt_bearer extracts the token
    db: db_dependency
) -> AuthUser:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode the JWT token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")  # Extract the 'sub' claim from the payload (now contains email)
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError as e:
        print(f"JWTError: {e}")  # Debugging log
        raise credentials_exception

    # Retrieve the user from the database based on the email
    user = db.query(UserModel).filter(UserModel.email == token_data.email).first()
    if user is None:
        raise credentials_exception

    # Return the AuthUser schema
    return AuthUser(
        user_id=user.user_id,
        username=user.username,
        email=user.email,
        created_at=user.created_at,
        is_active=user.is_active,
        is_admin=user.is_admin
    )