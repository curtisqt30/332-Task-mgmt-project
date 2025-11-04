from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import date
from app.models.task import Status

class TaskBase(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = None
    status: Status = Status.pending
    due: Optional[date] = None
    category: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[Status] = None
    due: Optional[date] = None
    category: Optional[str] = None

class TaskOut(TaskBase):
    model_config = ConfigDict(use_enum_values=True, from_attributes=True)
    id: int
