from sqlalchemy import Column, Integer, VARCHAR, Date, ForeignKey
from app.core.db import Base
from datetime import date as date_type


class Assignment(Base):
    __tablename__ = "assignment"
    taskID = Column(Integer, ForeignKey("tasks.id"), primary_key=True)
    userID = Column(Integer, ForeignKey("user.userID"), primary_key=True)
    role = Column(VARCHAR(50), default="assignee")
    assignedAt = Column(Date, default=date_type.today)