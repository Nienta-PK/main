from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from utils.deps import db_dependency
from utils.models import Task, Category, Priority, Status
from collections import defaultdict
from typing import Optional

router = APIRouter(
    prefix='/algo',
    tags=['algo']
)

def get_all_tasks_as_dict(db: Session, user_id: int):
    # Fetch all tasks for the current user with related categories, priorities, and statuses
    tasks = db.query(Task).filter(Task.user_id == user_id).all()  # Filter by user_id
    
    task_list = []
    for task in tasks:
        task_dict = {
            "task_id": task.task_id,
            "title": task.title,
            "category": task.category.name if task.category else None,
            "priority": task.priority.name,
            "status": task.status.name,
            "due_date": task.due_date,
            "is_important": task.is_important,
        }
        task_list.append(task_dict)
    
    return task_list

def count_tasks_by_field(tasks, field_name):
    counter = defaultdict(int)
    for task in tasks:
        field_value = task[field_name]
        counter[field_value] += 1
    return dict(counter)

def merge_sort(tasks, key):
    if len(tasks) <= 1:
        return tasks
    
    mid = len(tasks) // 2
    left_half = merge_sort(tasks[:mid], key)
    right_half = merge_sort(tasks[mid:], key)
    
    return merge(left_half, right_half, key)

def merge(left, right, key):
    result = []
    while left and right:
        if left[0][key] <= right[0][key]:
            result.append(left.pop(0))
        else:
            result.append(right.pop(0))
    result += left
    result += right
    return result

def search_tasks_by_title(tasks, search_term):
    result = []
    for task in tasks:
        if search_term.lower() in task["title"].lower():
            result.append(task)
    return result

@router.get("/tasks-overview")
def get_tasks_overview(db: db_dependency, user_id: int):
    # Retrieve all tasks for the current user from the database
    tasks = get_all_tasks_as_dict(db, user_id)

    # Count tasks by category, priority, and status
    category_counts = count_tasks_by_field(tasks, "category")
    priority_counts = count_tasks_by_field(tasks, "priority")
    status_counts = count_tasks_by_field(tasks, "status")

    # Return the tasks, number of tasks, and aggregated data
    return {
        "total_tasks": len(tasks),  # Total number of tasks for the user
        "tasks": tasks,  # List of tasks
        "category_counts": category_counts,
        "priority_counts": priority_counts,
        "status_counts": status_counts,
    }
