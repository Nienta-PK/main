from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from jose import jwt
import os
from utils.models import User as UserModel
from utils.deps import db_dependency
from dotenv import load_dotenv

router = APIRouter(
    prefix='/auth',
    tags=['auth']
)

# Load ENV
load_dotenv()

# Environment Variables
SECRET_KEY = os.getenv('AUTH_SECRET_KEY')
ALGORITHM = os.getenv('AUTH_ALGORITHM')
ACCESS_TOKEN_EXPIRE_MINUTES = 30
if not SECRET_KEY or not ALGORITHM:
    raise ValueError("Missing AUTH_SECRET_KEY or AUTH_ALGORITHM in environment variables")

# Pydantic model for the response
class UserInfoResponse(BaseModel):
    user_id: int
    is_admin: bool
    access_token: str  # Add token to the response

# Function to get user by email
def get_user_by_email(db: db_dependency, email: str) -> Optional[UserModel]:
    return db.query(UserModel).filter(UserModel.email == email).first()

# Function to create JWT token
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta is None:
        expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# New route to receive email as a query parameter and return user_id, is_admin, and token
@router.get("/get-user-info/{email}", response_model=UserInfoResponse)  # GET request for query param
async def get_user_info(email: str, db: db_dependency):
    # Check if the user exists in the database by email
    user = get_user_by_email(db, email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. Please register."
        )

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email},  # Using email in token payload
        expires_delta=access_token_expires
    )

    # Return the user_id, is_admin status, and token
    return {
        "user_id": user.user_id,
        "is_admin": user.is_admin,
        "access_token": access_token  # Return the JWT token
    }
