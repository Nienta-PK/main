from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, validator
from sqlalchemy.orm import Session
from utils.models import User
from utils.database import engine, Base
from utils.deps import db_dependency
from datetime import datetime
from passlib.context import CryptContext
from typing import Annotated

router = APIRouter(
    prefix='/auth',
    tags=['auth']
)

Base.metadata.create_all(bind=engine)

class UserCreate(BaseModel):
    username: str
    password: str
    email: EmailStr

    @validator('password')
    def password_strength(cls, v):
        min_length = 8
        special_characters = "!#$&@*"

        errors = []
        if len(v) < min_length:
            errors.append('at least 8 characters long')
        if not any(c in special_characters for c in v):
            errors.append(f'contain at least one special character: {special_characters}')
        if not any(c.isupper() for c in v):
            errors.append('contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            errors.append('contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            errors.append('contain at least one number')

        if errors:
            raise ValueError('Password must ' + ', '.join(errors) + '.')
        return v
    
class UserResponse(BaseModel):
    user_id: int
    username: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(plain_password: str) -> str:
    return pwd_context.hash(plain_password)

@router.post("/register", response_model=UserResponse)
async def register_user(user: UserCreate, db: db_dependency):
    existing_user = db.query(User).filter(
        (User.username == user.username) | (User.email == user.email)
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username or email already registered"
        )

    hashed_password = hash_password(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        password=hashed_password
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user