from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey, Boolean, JSON, Interval,Time
from utils.database import Base
import datetime
from sqlalchemy.orm import relationship

from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey, Boolean, Interval, Time
from utils.database import Base
import datetime
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = 'users'
    user_id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), nullable=False, unique=True)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    created_at = Column(TIMESTAMP, nullable=False, default=datetime.datetime.utcnow)
    is_active = Column(Boolean, nullable=False, default=True)
    is_admin = Column(Boolean, nullable=False, default=False)
    
    login_history = relationship("Login_History", back_populates="user")
    play_history = relationship("Play_History", back_populates="user")


class Login_History(Base):
    __tablename__ = 'login_history'
    login_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.user_id'), nullable=False)
    time = Column(Time, nullable=False)
    day = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    weekday_id = Column(Integer, ForeignKey('weekday.weekday_id'), nullable=False)
    
    user = relationship("User", back_populates="login_history")
    weekday = relationship("Weekday", back_populates="login_histories")


class Play_History(Base):
    __tablename__ = 'play_history'
    play_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.user_id'), nullable=False)
    timestamp = Column(TIMESTAMP, default=datetime.datetime.utcnow)
    time_to_finish = Column(Interval)
    mode = Column(String(10), nullable=False)  # e.g., 'easy', 'medium', 'hard'
    number_of_mistakes = Column(Integer)
    status = Column(String(50))  # e.g., completed, abandoned
    
    user = relationship("User", back_populates="play_history")


class Weekday(Base):
    __tablename__ = 'weekday'
    weekday_id = Column(Integer, primary_key=True, autoincrement=True)
    weekday_name = Column(String(10), nullable=False, unique=True)
    
    login_histories = relationship("Login_History", back_populates="weekday")

"""
class Ranking(Base):
    __tablename__ = 'ranking'
    rank_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.user_id'), nullable=False)
    score = Column(Integer)
    rank_position = Column(Integer)

class Resume_Table(Base):
    __tablename__ = 'resume_table'
    resume_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.user_id'), nullable=False)
    game_state = Column(JSON)  # To store the current state of the Sudoku board
    created_at = Column(TIMESTAMP, nullable=False, default=datetime.datetime.utcnow)"""