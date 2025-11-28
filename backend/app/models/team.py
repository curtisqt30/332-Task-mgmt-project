from sqlalchemy import Column, Integer, VARCHAR, ForeignKey
from app.core.db import Base


class Team(Base):
    __tablename__ = "team"
    teamID = Column(Integer, primary_key=True, autoincrement=True)
    teamName = Column(VARCHAR(100), nullable=False)
    joinCode = Column(VARCHAR(6), unique=True, nullable=False)
    creatorID = Column(Integer, ForeignKey("user.userID"), nullable=False)