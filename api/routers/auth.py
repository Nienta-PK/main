#---- auth.py ----#
from fastapi import Depends, HTTPException, status, APIRouter
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from datetime import timedelta,datetime
from typing import Annotated, Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from utils.models import User as UserModel
from utils.deps import db_dependency, get_current_user, AuthUser
import os
from dotenv import load_dotenv

# ------------------- Load ENV ------------------- #
load_dotenv()

# Environment Variables
SECRET_KEY = os.getenv('AUTH_SECRET_KEY')
ALGORITHM = os.getenv('AUTH_ALGORITHM')
ACCESS_TOKEN_EXPIRE_MINUTES = 30
if not SECRET_KEY or not ALGORITHM:
    raise ValueError("Missing AUTH_SECRET_KEY or AUTH_ALGORITHM in environment variables")

router = APIRouter(
    prefix='/auth',
    tags=['auth']
)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 Scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

# Pydantic models
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class User(BaseModel):
    user_id: Optional[int] = None
    username: str
    email: Optional[str] = None
    created_at: Optional[datetime] = None
    is_active: Optional[bool] = None 
    
    class Config:
        from_attributes = True

class UserInDB(User):
    password: str
    class Config:
        from_attributes = True

# ------------------- Helper Functions ------------------- #
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def get_user(db: Session, username: str) -> Optional[UserInDB]:
    db_user = db.query(UserModel).filter(UserModel.username == username).first()
    if db_user:
        return UserInDB(
            user_id=db_user.user_id,
            username=db_user.username,
            email=db_user.email,
            password=db_user.password,
            created_at=db_user.created_at,
            is_active=db_user.is_active
        )
    return None

def authenticate_user(db: Session, username: str, password: str) -> Optional[UserInDB]:
    user = get_user(db, username)
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


# ------------------- Authentication Routes ------------------- #
@router.post("/token", response_model=Token)
async def login_for_access_token(
    db: db_dependency,
    form_data: OAuth2PasswordRequestForm = Depends()
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
