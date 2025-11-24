from sqlalchemy import Column, Integer, VARCHAR
from app.core.db import Base


class User(Base):
    __tablename__ = "user"
    userID = Column(Integer, primary_key=True)
    userName = Column(VARCHAR(100), nullable=False, unique=True)
    passHash = Column(Integer, Nullable=False)