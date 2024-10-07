from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey, Boolean, JSON, Interval, Time, Text
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
    tasks = relationship("Task", back_populates="user")


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


class Weekday(Base):
    __tablename__ = 'weekday'
    weekday_id = Column(Integer, primary_key=True, autoincrement=True)
    weekday_name = Column(String(10), nullable=False, unique=True)
    
    login_histories = relationship("Login_History", back_populates="weekday")


class Category(Base):
    __tablename__ = 'categories'
    category_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    
    tasks = relationship("Task", back_populates="category")


class Tag(Base):
    __tablename__ = 'tags'
    tag_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False, unique=True)
    
    task_tags = relationship("TaskTag", back_populates="tag")


class Task(Base):
    __tablename__ = 'tasks'
    task_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.user_id'), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP, nullable=False, default=datetime.datetime.utcnow)
    due_date = Column(TIMESTAMP, nullable=True)
    priority = Column(Integer, nullable=False, default=0)  # 0=Low, 1=Medium, 2=High
    status = Column(String(50), nullable=False, default="pending")  # pending, in-progress, finished
    is_important = Column(Boolean, nullable=False, default=False)
    finished_date = Column(TIMESTAMP, nullable=True)  # Add finished date field

    # Relationships
    user = relationship("User", back_populates="tasks")
    category_id = Column(Integer, ForeignKey('categories.category_id'), nullable=True)
    category = relationship("Category", back_populates="tasks")
    tags = relationship("TaskTag", back_populates="task")


class TaskTag(Base):
    __tablename__ = 'task_tags'
    task_id = Column(Integer, ForeignKey('tasks.task_id'), primary_key=True)
    tag_id = Column(Integer, ForeignKey('tags.tag_id'), primary_key=True)
    
    task = relationship("Task", back_populates="tags")
    tag = relationship("Tag", back_populates="task_tags")
