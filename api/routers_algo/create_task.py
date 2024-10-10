from fastapi import APIRouter, HTTPException, Depends
from utils.models import Task, Category, Priority, Status  # Import your models
from utils.deps import db_dependency  # Import your database dependency
from pydantic import BaseModel
from datetime import date, time, datetime

router = APIRouter(
    prefix='/algo',
    tags=['algo']
)

class TaskCreate(BaseModel):
    user_id: int
    title: str
    description: str = None
    due_date: date
    due_time: time
    is_important: bool
    category_id: int
    priority_id: int
    status_id: int=1

    class Config:
        from_attribute = True

@router.post("/tasks", response_model=TaskCreate)
def create_task(task: TaskCreate, db: db_dependency):
    # Fetch all categories, priorities, and statuses to perform linear search
    categories = db.query(Category).all()
    priorities = db.query(Priority).all()
    statuses = db.query(Status).all()

    # Linear search for category
    category = None
    for cat in categories:
        if cat.category_id == task.category_id:
            category = cat
            break

    # Linear search for priority
    priority = None
    for pri in priorities:
        if pri.priority_id == task.priority_id:
            priority = pri
            break

    # Linear search for status
    status = None
    for stat in statuses:
        if stat.status_id == task.status_id:
            status = stat
            break

    # If any of the items are not found, raise an error
    if not category or not priority or not status:
        raise HTTPException(status_code=400, detail="Invalid category, priority, or status")

    # Combine due_date and due_time into a single datetime for storage in the database
    duedate = datetime.combine(task.due_date, task.due_time)
    
    # Create a new task in the database
    new_task = Task(
        user_id=task.user_id,  # Replace this with actual user ID from session/authentication
        title=task.title,
        description=task.description,
        due_date=duedate,  # Store the combined due date and time as TIMESTAMP
        is_important=task.is_important,
        category_id=task.category_id,
        priority_id=task.priority_id,
        status_id=task.status_id
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    # Prepare the response with separate date and time
    response_task = {
        "user_id": new_task.user_id,
        "title": new_task.title,
        "description": new_task.description,
        "due_date": new_task.due_date.date(),  # Extract date part
        "due_time": new_task.due_date.time(),  # Extract time part
        "is_important": new_task.is_important,          
        "category_id": new_task.category_id,
        "priority_id": new_task.priority_id,
        "status_id": new_task.status_id
    }

    return response_task
