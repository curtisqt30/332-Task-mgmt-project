from sqlalchemy import Column, Integer, VARCHAR, Date, ForeignKey
from app.core.db import Base

class Membership(Base):
    __tablename__ = "membership"
    teamID = Column(Integer, ForeignKey("team.teamID"), primary_key=True)
    role = Column(VARCHAR(100), unique=True, nullable=False)
    joinedat = Column(Date)
    userID = Column(Integer, ForeignKey("user.userID"), primary_key=True)