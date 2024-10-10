from fastapi import APIRouter, Depends, HTTPException
from typing import List
from utils.deps import db_dependency
from utils.models import Task
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

# Pydantic model for Task response
class TaskResponse(BaseModel):
    task_id: int
    title: str
    description: str
    due_date: datetime

    class Config:
        from_attribute = True


# Endpoint to get tasks for a specific user using linear search
@router.get("/task-for-calendar", response_model=List[TaskResponse])
def get_tasks(user_id: int, db: db_dependency):
    # Fetch all tasks from the database
    all_tasks = db.query(Task).all()

    # Linear search to filter tasks by user_id
    user_tasks = [task for task in all_tasks if task.user_id == user_id]

    # If no tasks are found for the user, you can return an empty list or raise an exception
    if not user_tasks:
        raise HTTPException(status_code=404, detail="No tasks found for this user")

    return user_tasks
