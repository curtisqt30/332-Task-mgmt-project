from sqlalchemy import Column, Integer, String, Text, Date, Enum, ForeignKey
from app.core.db import Base
import enum

class Status(str, enum.Enum):
    pending = "Pending"
    in_progress = "In Progress"
    completed = "Completed"
    overdue = "Overdue"

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text)
    status = Column(Enum(Status), nullable=False, default=Status.pending)
    due = Column(Date)
    category = Column(String(64))
    ownerUserID = Column(Integer, ForeignKey("user.userID"), nullable=False)