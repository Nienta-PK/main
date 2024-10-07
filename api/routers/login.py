from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from datetime import timedelta, datetime
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from utils.models import User as UserModel, Login_History as LoginHistoryModel  # Import Login_History model
from utils.deps import db_dependency
import os
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

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Pydantic models
class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int  # Add user_id to the response model
    is_admin: bool

# Helper Functions
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_user_by_email(db: Session, email: str) -> Optional[UserModel]:
    return db.query(UserModel).filter(UserModel.email == email).first()

def authenticate_user(db: Session, email: str, password: str) -> Optional[UserModel]:
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.password):
        return None
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta is None:
        expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Login Endpoint
# Updated login_for_access_token to log all date components
@router.post("/login", response_model=Token)
async def login_for_access_token(
    db: db_dependency,
    form_data: OAuth2PasswordRequestForm = Depends()
):
    user = authenticate_user(db, form_data.username, form_data.password)  # Using form_data.username for email
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",  # Updated error message to reference email
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Current date and time
    current_time = datetime.utcnow() + timedelta(hours=7)
    weekday = current_time.isoweekday()  # ISO weekday: Monday=1, Sunday=7

    # Log login history
    login_history = LoginHistoryModel(
        user_id=user.user_id,
        time=current_time.time(),  # Store only time
        day=current_time.day,
        month=current_time.month,
        year=current_time.year,
        weekday_id=weekday  # Use ISO weekday directly if it matches Weekday table ids
    )
    db.add(login_history)
    db.commit()  # Commit the login history to the database

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email},  # Using email in token payload
        expires_delta=access_token_expires
    )

    # Return token, user_id, and token type
    return {"access_token": access_token, "token_type": "bearer", "user_id": user.user_id, "is_admin": user.is_admin}

