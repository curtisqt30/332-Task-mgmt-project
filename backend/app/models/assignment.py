from sqlalchemy import Column, Integer, VARCHAR, Date, ForeignKey
from app.core.db import Base

class Assignment(Base):
    __tablename__ = "assignment"
    taskID = Column(Integer, ForeignKey("task.id"), primary_key=True)
    role = Column(VARCHAR(50))
    assignedat = Column(Date)
    userID = Column(Integer, ForeignKey("user.userID"), primary_key=True)