from pydantic import BaseModel
from typing import Optional
from fastapi import APIRouter, Depends
from datetime import datetime, timedelta
from utils.deps import db_dependency
from utils.models import Task
from typing import Dict, List

class TaskResponseOneDayLeft(BaseModel):
    task_id: int
    title: str
    description: Optional[str]
    due_date: Optional[datetime]
    time_remain: str

class TaskResponseOneWeekLeft(BaseModel):
    task_id: int
    title: str
    description: Optional[str]
    due_date: Optional[datetime]
    day_remain: int
    time_remain: str

router = APIRouter()

# Modify the endpoint to filter ongoing tasks
@router.get("/tasks/grouped", response_model=Dict[str, List[Dict]])
def get_grouped_tasks(db: db_dependency):
    # Assuming 'Ongoing' status has a status_id of 1 (you can adjust this based on your DB)
    ongoing_status_id = 1
    
    # Query only ongoing tasks
    tasks = db.query(Task).filter(Task.status_id == ongoing_status_id).all()

    # Initialize groups
    grouped_tasks = {
        "oneday_left": [],
        "oneweek_left": []
    }

    # Get current time
    now = datetime.utcnow()

    for task in tasks:
        if task.due_date:
            # Calculate the remaining time
            time_remaining = task.due_date - now
            days_remaining = time_remaining.days

            # If time remaining is less than or equal to 1 day
            if 0 <= time_remaining.total_seconds() <= 86400:  # 86400 seconds = 1 day
                grouped_tasks["oneday_left"].append({
                    "task_id": task.task_id,
                    "title": task.title,
                    "description": task.description,
                    "due_date": task.due_date.isoformat(),  # Convert datetime to ISO format string
                    "time_remain": str(time_remaining)  # Example format: '00:10:00'
                })

            # If time remaining is between 1 and 7 days
            elif 1 < days_remaining <= 7:
                grouped_tasks["oneweek_left"].append({
                    "task_id": task.task_id,
                    "title": task.title,
                    "description": task.description,
                    "due_date": task.due_date,
                    "day_remain": days_remaining,
                    "time_remain": str(time_remaining)  # Example format: '6 days, 1:00:00'
                })

    return grouped_tasks
