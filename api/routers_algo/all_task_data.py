from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from utils.models import Task, Status, Category, Priority  # Import the Priority model
from utils.deps import db_dependency
from datetime import datetime,timedelta

router = APIRouter(
    prefix='/algo',
    tags=['algo']
)

# Pydantic model to define the structure of Task data
class TaskResponse(BaseModel):
    task_id: int
    user_id: int
    title: str
    description: Optional[str] = None
    created_at: datetime
    due_date: Optional[datetime] = None
    is_important: bool
    finished_date: Optional[datetime] = None
    category: Optional[str] = None  # Category as string
    priority: Optional[str] = None  # Priority as string
    status: Optional[str] = None  # Status as string

    class Config:
        from_attribute = True


# Generic selection sort function based on sorting key
def selection_sort(tasks_dict, sort_key):
    n = len(tasks_dict)
    for i in range(n):
        min_index = i
        for j in range(i + 1, n):
            if tasks_dict[j][sort_key] < tasks_dict[min_index][sort_key]:
                min_index = j
        tasks_dict[i], tasks_dict[min_index] = tasks_dict[min_index], tasks_dict[i]
    return tasks_dict

# Merge Sort for sorting by due_date
def merge_sort_due_date(tasks):
    if len(tasks) <= 1:
        return tasks

    mid = len(tasks) // 2
    left = merge_sort_due_date(tasks[:mid])
    right = merge_sort_due_date(tasks[mid:])

    return merge(left, right)

def merge(left, right):
    sorted_list = []
    while left and right:
        if left[0]['due_date'] <= right[0]['due_date']:
            sorted_list.append(left.pop(0))
        else:
            sorted_list.append(right.pop(0))

    return sorted_list + left + right

# Linear search algorithm to find tasks by title
def search_by_title(tasks_dict, title):
    matched_tasks = []
    for task in tasks_dict:
        if title.lower() in task['title'].lower():
            matched_tasks.append(task)
    return matched_tasks

# Linear search to find status by status_id
def find_status_name(statuses, status_id):
    for status in statuses:
        if status.status_id == status_id:
            return status.name
    return "Unknown"  # In case status_id doesn't match any status

# Linear search to find category by category_id
def find_category_name(categories, category_id):
    for category in categories:
        if category.category_id == category_id:
            return category.name
    return "Unknown"  # In case category_id doesn't match any category

# Linear search to find priority by priority_id
def find_priority_name(priorities, priority_id):
    for priority in priorities:
        if priority.priority_id == priority_id:
            return priority.name
    return "Unknown"  # In case priority_id doesn't match any priority

# Helper function to find a status by name using linear search
def find_status_by_name(statuses, name):
    for status in statuses:
        if status.name == name:
            return status
    return None  # Return None if not found


@router.get("/get-all-tasks", response_model=List[TaskResponse])
def get_tasks(
    db: db_dependency,
    user_id: int,
    sorting_status: str = "task_id", 
    reverse_status: bool = False, 
    title: Optional[str] = None,  
    category: Optional[str] = None,  
    status: Optional[str] = None,  
    priority: Optional[str] = None  
):
    # Fetch tasks, statuses, categories, and priorities from the database
    tasks = db.query(Task).filter(Task.user_id == user_id).all()
    statuses = db.query(Status).all()
    categories = db.query(Category).all()
    priorities = db.query(Priority).all()

    # Linear search for 'Delayed' and 'Ongoing' statuses
    delay_status = find_status_by_name(statuses, "Delayed")
    ongoing_status = find_status_by_name(statuses, "Ongoing")

    tasks_dict = [task.__dict__ for task in tasks]
    
    for task in tasks_dict:
        # Adjust time with +7 hours
        current_time_with_offset = datetime.utcnow() + timedelta(hours=7)

        # Convert 'created_at' to string
        if 'created_at' in task:
            task['create_date'] = task['created_at'].strftime('%Y-%m-%d %H:%M:%S')

        # Check if due date has passed and update to 'Delayed' if in 'Ongoing' status
        if task['due_date'] and task['due_date'] < current_time_with_offset and task['status_id'] == ongoing_status.status_id:
            task_in_db = db.query(Task).filter(Task.task_id == task['task_id']).first()
            task_in_db.status_id = delay_status.status_id
            db.commit()  # Commit the change
            db.refresh(task_in_db)
            task['status_id'] = delay_status.status_id

        task['status'] = find_status_name(statuses, task['status_id'])
        task.pop('status_id', None)  # Remove 'status_id' after converting

        task['category'] = find_category_name(categories, task['category_id'])
        task.pop('category_id', None)

        task['priority'] = find_priority_name(priorities, task['priority_id'])
        task.pop('priority_id', None)

    if title:
        tasks_dict = search_by_title(tasks_dict, title)

    if category:
        tasks_dict = [task for task in tasks_dict if task['category'].lower() == category.lower()]

    if status:
        tasks_dict = [task for task in tasks_dict if task['status'].lower() == status.lower()]

    if priority:
        tasks_dict = [task for task in tasks_dict if task['priority'].lower() == priority.lower()]

    if not tasks_dict:
        raise HTTPException(status_code=404, detail="No tasks match the given filters")

    if sorting_status == "due_date":
        tasks_dict = merge_sort_due_date(tasks_dict)
    else:
        tasks_dict = selection_sort(tasks_dict, sorting_status)

    if reverse_status:
        tasks_dict.reverse()

    return tasks_dict


@router.put("/complete-task/{task_id}", response_model=TaskResponse)
def complete_task(task_id: int, db: db_dependency):
    task = db.query(Task).filter(Task.task_id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Linear search for statuses
    statuses = db.query(Status).all()
    completed_status = find_status_by_name(statuses, "Completed")
    delayed_status = find_status_by_name(statuses, "Delayed")
    late_status = find_status_by_name(statuses, "Late")
    abandoned_status = find_status_by_name(statuses, "Abandoned")

    if not completed_status or not delayed_status or not late_status or not abandoned_status:
        raise HTTPException(status_code=404, detail="Required statuses not found")

    if task.status_id == abandoned_status.status_id or task.status_id == late_status.status_id:
        raise HTTPException(status_code=400, detail="Task with status 'Abandoned' cannot be completed")

    if task.status_id == delayed_status.status_id:
        task.status_id = late_status.status_id
        db.commit()  # Commit the change to 'Late'
        db.refresh(task)

        return TaskResponse(
            task_id=task.task_id,
            user_id=task.user_id,
            title=task.title,
            description=task.description,
            created_at=task.created_at,
            due_date=task.due_date,
            is_important=task.is_important,
            finished_date=task.finished_date,
            category=task.category.name if task.category else None,
            priority=task.priority.name if task.priority else None,
            status=task.status.name
        )

    task.status_id = completed_status.status_id
    task.finished_date = datetime.utcnow() + timedelta(hours=7)  # Adjust time with +7 hours

    db.commit()
    db.refresh(task)

    return TaskResponse(
        task_id=task.task_id,
        user_id=task.user_id,
        title=task.title,
        description=task.description,
        created_at=task.created_at,
        due_date=task.due_date,
        is_important=task.is_important,
        finished_date=task.finished_date,
        category=task.category.name if task.category else None,
        priority=task.priority.name if task.priority else None,
        status=task.status.name
    )


@router.put("/abandon-task/{task_id}", response_model=TaskResponse)
def abandon_task(task_id: int, db: db_dependency):
    task = db.query(Task).filter(Task.task_id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Linear search for statuses
    statuses = db.query(Status).all()
    abandoned_status = find_status_by_name(statuses, "Abandoned")
    late_status = find_status_by_name(statuses, "Late")
    completed_status = find_status_by_name(statuses, "Completed")

    if not abandoned_status or not late_status or not completed_status:
        raise HTTPException(status_code=404, detail="Required statuses not found")

    if task.status_id == late_status.status_id or task.status_id == completed_status.status_id:
        raise HTTPException(status_code=400, detail="Task cannot be abandoned because it is 'Late' or 'Completed'")
    
    if task.status_id == abandoned_status.status_id:
        raise HTTPException(status_code=400, detail="Task already 'Abandoned'")
    
    task.status_id = abandoned_status.status_id
    db.commit()
    db.refresh(task)

    return TaskResponse(
        task_id=task.task_id,
        user_id=task.user_id,
        title=task.title,
        description=task.description,
        created_at=task.created_at,
        due_date=task.due_date,
        is_important=task.is_important,
        finished_date=task.finished_date,
        category=task.category.name if task.category else None,
        priority=task.priority.name if task.priority else None,
        status=task.status.name
    )
