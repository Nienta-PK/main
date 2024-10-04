from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from utils.models import Login_History, Weekday
from utils.deps import db_dependency
from pydantic import BaseModel
import logging

router = APIRouter(
    prefix='/data',
    tags=['data']
)

class LoginHistoryResponse(BaseModel):
    login_id: int
    user_id: int
    time: str  # Use str to directly represent time in HH:MM:SS format
    day: int
    month: int
    year: int
    weekday: str

    class Config:
        from_attributes = True

# Endpoint to retrieve all login history records
@router.get("/login-history/", response_model=List[LoginHistoryResponse])
def get_all_login_history(db: db_dependency):
    login_history_records = db.query(Login_History).join(Weekday).all()
    if not login_history_records:
        raise HTTPException(status_code=404, detail="No login history records found")

    # Transform results to include weekday name
    results = [
        LoginHistoryResponse(
            login_id=record.login_id,
            user_id=record.user_id,
            time=record.time.strftime("%H:%M:%S"),
            day=record.day,
            month=record.month,
            year=record.year,
            weekday=record.weekday.weekday_name
        )
        for record in login_history_records
    ]

    return results

@router.get("/login-history/user/{user_id}", response_model=List[LoginHistoryResponse])
def get_login_history_by_user(user_id: int, db: db_dependency):
    login_history_records = db.query(Login_History).join(Weekday).filter(Login_History.user_id == user_id).all()
    logging.info(f"Records found for user {user_id}: {len(login_history_records)}")

    if not login_history_records:
        raise HTTPException(status_code=404, detail="No login history records found for this user")

    results = [
        LoginHistoryResponse(
            login_id=record.login_id,
            user_id=record.user_id,
            time=record.time.strftime("%H:%M:%S"),
            day=record.day,
            month=record.month,
            year=record.year,
            weekday=record.weekday.weekday_name
        )
        for record in login_history_records
    ]
    return results

