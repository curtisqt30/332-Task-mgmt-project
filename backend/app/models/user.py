from sqlalchemy import Column, Integer, String
from app.core.db import Base


class User(Base):
    __tablename__ = "user"
    userID = Column(Integer, primary_key=True, autoincrement=True)
    userName = Column(String(100), nullable=False, unique=True)
    passHash = Column(String(255), nullable=False)