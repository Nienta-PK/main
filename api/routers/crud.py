from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr, validator
from utils.models import User
from utils.deps import db_dependency, get_current_user, AuthUser
from datetime import datetime
from passlib.context import CryptContext
from typing import Annotated, Optional

#Admin Access
"""if user_id != current_user.user_id and not current_user.is_admin:
    raise HTTPException(status_code=403, detail="Not authorized to perform this action")"""

router = APIRouter(
    prefix='/crud',
    tags=['crud']
) 

class UserResponse(BaseModel):
    user_id: int
    username: str
    email: str
    created_at: datetime
    
    class Config:
        from_attributes = True
        arbitrary_types_allowed = True

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
    
class UserUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    email: Optional[EmailStr] = None

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

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def hash_password(plain_password: str) -> str:
    return pwd_context.hash(plain_password)

@router.get("/users/{user_id}",response_model=UserResponse)
async def get_user(user_id: int, db: db_dependency,current_user: Annotated[AuthUser, Depends(get_current_user)]):
    if user_id != current_user.user_id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to delete this user")
    db_user = db.query(User).filter(User.user_id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: db_dependency,
    current_user: Annotated[AuthUser, Depends(get_current_user)]
):
    # Ensure the user can only update their own data
    if user_id != current_user.user_id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to delete this user")

    db_user = db.query(User).filter(User.user_id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update fields if provided
    if user_update.username:
        # Check if the new username is already taken
        existing_user = db.query(User).filter(User.username == user_update.username).first()
        if existing_user and existing_user.user_id != user_id:
            raise HTTPException(status_code=400, detail="Username already taken")
        db_user.username = user_update.username

    if user_update.email:
        # Check if the new email is already taken
        existing_user = db.query(User).filter(User.email == user_update.email).first()
        if existing_user and existing_user.user_id != user_id:
            raise HTTPException(status_code=400, detail="Email already registered")
        db_user.email = user_update.email

    if user_update.password:
        hashed_password = hash_password(user_update.password)
        db_user.password = hashed_password

    db.commit()
    db.refresh(db_user)

    return db_user

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: db_dependency,
    current_user: Annotated[AuthUser, Depends(get_current_user)]
):
    # Ensure the user can only delete their own account
    if user_id != current_user.user_id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to delete this user")

    db_user = db.query(User).filter(User.user_id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(db_user)
    db.commit()

    return None  # Return 204 No Content