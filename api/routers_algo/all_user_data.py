from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from utils.models import User
from utils.deps import db_dependency
from datetime import datetime

# Import your models and create database session
router = APIRouter(
    prefix='/algo',
    tags=['algo']
)

# Pydantic model to define the structure of User data
class UserResponse(BaseModel):
    user_id: int
    username: str
    email: str
    is_active: bool
    is_admin: bool
    create_date: str

    class Config:
        from_attribute = True

# Generic selection sort function based on sorting key
def selection_sort(users_dict, sort_key):
    n = len(users_dict)
    for i in range(n):
        min_index = i
        for j in range(i + 1, n):
            if users_dict[j][sort_key] < users_dict[min_index][sort_key]:
                min_index = j
        users_dict[i], users_dict[min_index] = users_dict[min_index], users_dict[i]
    return users_dict

# Linear search algorithm to find a user by username
def search_by_username(users_dict, username):
    for user in users_dict:
        if user['username'].lower() == username.lower():
            return user
    return None

# Route to get all users, sort them, search by username, or return sorted users
@router.get("/all_users", response_model=List[UserResponse])
def get_users(
    db: db_dependency, 
    sorting_status: str = "user_id", 
    reverse_status: bool = False, 
    username: Optional[str] = None  # Optional parameter for searching by username
):
    users = db.query(User).all()
    users_dict = [user.__dict__ for user in users]
    
    # Remove SQLAlchemy session-specific keys, such as '_sa_instance_state'
    for user in users_dict:
        user.pop('_sa_instance_state', None)

        # Convert 'created_at' (datetime) to 'create_date' (string)
        if 'created_at' in user:
            user['create_date'] = user['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            user.pop('created_at', None)  # Remove 'created_at' after converting

    # If searching by username, perform the search and return the result
    if username:
        found_user = search_by_username(users_dict, username)
        if found_user:
            return [found_user]  # Return the matched user
        raise HTTPException(status_code=404, detail=f"User with username '{username}' not found")

    # Determine sort key based on sorting_status input
    sort_key = "user_id"  # Default sort by user_id
    if sorting_status == "username":
        sort_key = "username"
    elif sorting_status == "create_date":
        sort_key = "create_date"
    elif sorting_status == "is_admin":
        sort_key = "is_admin"

    # Sort users by the chosen key
    users_dict = selection_sort(users_dict, sort_key)

    # Reverse the list if reverse_status is True
    if reverse_status:
        users_dict.reverse()

    # If id is 0 or no match is found, return all sorted users
    return users_dict

#----------------- Delete ------------------------#

# Linear search function to find a user by user_id
def search_by_user_id(users_dict, user_id):
    for user in users_dict:
        if user['user_id'] == user_id:
            return user
    return None

# Delete user endpoint using linear search
@router.delete("/delete_user/{user_id}")
def delete_user(user_id: int, db: db_dependency):
    # Fetch all users from the database
    users = db.query(User).all()
    users_dict = [user.__dict__ for user in users]

    # Remove SQLAlchemy session-specific keys, such as '_sa_instance_state'
    """  for user in users_dict:
            user.pop('_sa_instance_state', None)"""

    # Use linear search to find the user by user_id
    found_user = search_by_user_id(users_dict, user_id)

    if not found_user:
        # Raise an error if the user does not exist
        raise HTTPException(status_code=404, detail=f"User with user_id '{user_id}' not found")

    # Fetch the actual user object using user_id to delete it from the database
    user_to_delete = db.query(User).filter(User.user_id == user_id).first()

    if user_to_delete:
        db.delete(user_to_delete)  # Delete the user (Need fix CASCADE)
        db.commit()  # Commit the transaction

    # Return a success message
    return {"message": f"User with user_id '{user_id}' has been deleted successfully"}