from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.db import SessionLocal
from app.models.task import Task, Status
from app.schemas.task import TaskCreate, TaskUpdate, TaskOut

router = APIRouter(tags=["tasks"])

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

@router.get("/tasks", response_model=List[TaskOut])
def list_tasks(q: Optional[str] = Query(None), status: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(Task)
    if q: query = query.filter(Task.title.ilike(f"%{q}%"))
    if status: query = query.filter(Task.status == status)
    return query.order_by(Task.id.desc()).all()

@router.post("/tasks", response_model=TaskOut, status_code=201)
def create_task(data: TaskCreate, db: Session = Depends(get_db)):
    obj = Task(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

@router.patch("/tasks/{task_id}", response_model=TaskOut)
def update_task(task_id: int, data: TaskUpdate, db: Session = Depends(get_db)):
    obj = db.get(Task, task_id)
    if not obj: raise HTTPException(404, "Task not found")
    for k, v in data.model_dump(exclude_unset=True).items(): setattr(obj, k, v)
    db.commit(); db.refresh(obj)
    return obj

@router.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    obj = db.get(Task, task_id)
    if not obj: raise HTTPException(404, "Task not found")
    db.delete(obj); db.commit()
    return None
