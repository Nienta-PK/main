from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from utils.deps import db_dependency
from utils.models import Play_History
from typing import List

router = APIRouter(
    prefix='/data',
    tags=['data']
)

# ------ schemas.py ------
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional

class PlayHistoryResponse(BaseModel):
    play_id: int
    user_id: int
    timestamp: datetime
    time_to_finish: Optional[str]  # Change to string for the response
    mode: str
    number_of_mistakes: Optional[int]
    status: Optional[str]

    class Config:
        from_attributes = True

    @staticmethod
    def from_orm(play_history):
        # Convert timedelta to a readable string format
        time_to_finish_str = None
        if play_history.time_to_finish:
            total_seconds = int(play_history.time_to_finish.total_seconds())
            hours, remainder = divmod(total_seconds, 3600)
            minutes, seconds = divmod(remainder, 60)
            time_to_finish_str = f"{hours:02}:{minutes:02}:{seconds:02}"
        
        return PlayHistoryResponse(
            play_id=play_history.play_id,
            user_id=play_history.user_id,
            timestamp=play_history.timestamp,
            time_to_finish=time_to_finish_str,
            mode=play_history.mode,
            number_of_mistakes=play_history.number_of_mistakes,
            status=play_history.status
        )

@router.get("/play-history/", response_model=List[PlayHistoryResponse])
def get_all_play_history(db: db_dependency):
    play_history_records = db.query(Play_History).all()
    if not play_history_records:
        raise HTTPException(status_code=404, detail="No play history records found")
    # Use from_orm to convert each record into the Pydantic model format
    return [PlayHistoryResponse.from_orm(record) for record in play_history_records]

@router.get("/play-history/user/{user_id}", response_model=List[PlayHistoryResponse])
def get_play_history_by_user(user_id: int, db: db_dependency):
    play_history_records = db.query(Play_History).filter(Play_History.user_id == user_id).all()
    if not play_history_records:
        raise HTTPException(status_code=404, detail="No play history records found for this user")
    return [PlayHistoryResponse.from_orm(record) for record in play_history_records]