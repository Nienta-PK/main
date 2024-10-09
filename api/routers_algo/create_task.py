from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from models import Task  # Import your Task model
from database import get_db  # Import your database dependency
from pydantic import BaseModel  # Import your Pydantic model

app = FastAPI()


class TaskCreate(BaseModel):
    title: str
    description: str = None
    due_date: date
    due_time: time
    is_important: bool
    category_id: int
    priority_id: int
    status_id: int

@app.post("/tasks", response_model=TaskCreate)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    # Check if category, priority, and status exist in the database
    category = db.query(Category).filter(Category.id == task.category_id).first()
    priority = db.query(Priority).filter(Priority.id == task.priority_id).first()
    status = db.query(Status).filter(Status.id == task.status_id).first()

    if not category or not priority or not status:
        raise HTTPException(status_code=400, detail="Invalid category, priority, or status")

    # Create a new task in the database
    new_task = Task(
        title=task.title,
        description=task.description,
        due_date=task.due_date,
        due_time=task.due_time,
        is_important=task.is_important,
        category_id=task.category_id,
        priority_id=task.priority_id,
        status_id=task.status_id
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return new_task
