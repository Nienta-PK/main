from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey, Boolean, JSON
from utils.database import Base
import datetime

class User(Base):
    __tablename__ = 'users'
    user_id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), nullable=False, unique=True)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    created_at = Column(TIMESTAMP, nullable=False, default=datetime.datetime.utcnow)
    is_active = Column(Boolean, nullable=False, default=True)
    is_admin = Column(Boolean, nullable=False, default=False)

class Login_History(Base):
    __tablename__ = 'Login_History'
    login_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.user_id'), nullable=False)
    timestamp = Column(TIMESTAMP, default=datetime.datetime.utcnow)

"""class Play_History(Base):
    __tablename__ = 'play_history'
    play_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.user_id'), nullable=False)
    timestamp = Column(TIMESTAMP, default=datetime.datetime.utcnow)
    time_to_finish = Column(Interval)
    mode = Column(String(10), nullable=False)  # e.g., 'easy', 'medium', 'hard'
    number_of_mistakes = Column(Integer)
    status = Column(String(50))  # e.g., completed, abandoned

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