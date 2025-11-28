from sqlalchemy import Column, Integer, VARCHAR, Date, ForeignKey
from app.core.db import Base
from datetime import date as date_type


class Membership(Base):
    __tablename__ = "membership"
    userID = Column(Integer, ForeignKey("user.userID"), primary_key=True)
    teamID = Column(Integer, ForeignKey("team.teamID"), primary_key=True)
    role = Column(VARCHAR(50), nullable=False, default="member")
    joinedAt = Column(Date, default=date_type.today)