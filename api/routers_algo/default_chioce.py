from fastapi import APIRouter, HTTPException
from typing import List
from utils.models import Category, Priority, Status, Weekday
from utils.deps import db_dependency  # Import your dependency from deps.py
from pydantic import BaseModel

router = APIRouter(
    prefix= '/algo',
    tags=['algo']
)

# Define the Pydantic models for API response
class CategoryResponse(BaseModel):
    category_id: int
    name: str
    description: str

    class Config:
        from_attribute = True

class PriorityResponse(BaseModel):
    priority_id: int
    name: str

    class Config:
        from_attribute = True

class StatusResponse(BaseModel):
    status_id: int
    name: str

    class Config:
        from_attribute = True

class WeekdayResponse(BaseModel):
    weekday_id: int
    weekday_name: str

    class Config:
        from_attribute = True

@router.get("/categories", response_model=List[CategoryResponse])
def get_categories(db: db_dependency):
    categories = db.query(Category).all()
    if not categories:
        raise HTTPException(status_code=404, detail="No categories found.")
    return categories

@router.get("/priorities", response_model=List[PriorityResponse])
def get_priorities(db: db_dependency):
    priorities = db.query(Priority).all()
    if not priorities:
        raise HTTPException(status_code=404, detail="No priorities found.")
    return priorities

@router.get("/statuses", response_model=List[StatusResponse])
def get_statuses(db: db_dependency):
    statuses = db.query(Status).all()
    if not statuses:
        raise HTTPException(status_code=404, detail="No statuses found.")
    return statuses

@router.get("/weekdays", response_model=List[WeekdayResponse])
def get_weekdays(db: db_dependency):
    weekdays = db.query(Weekday).all()
    if not weekdays:
        raise HTTPException(status_code=404, detail="No weekdays found.")
    return weekdays
