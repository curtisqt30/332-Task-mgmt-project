from sqlalchemy import Column, Integer, VARCHAR
from app.core.db import Base


class Team(Base):
    __tablename__ = "team"
    teamID = Column(Integer, primarykey=True)
    teamname = Column(VARCHAR(100), unique=True, nullable=False)