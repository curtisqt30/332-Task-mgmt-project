from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.db import SessionLocal
from app.models.task import Task, Status
from app.schemas.task import TaskCreate, TaskUpdate, TaskOut
from app.api.routes_auth import get_current_user_id

router = APIRouter(tags=["tasks"])

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

@router.get("/tasks", response_model=List[TaskOut])
def list_tasks(
    request: Request,
    q: Optional[str] = Query(None), 
    status: Optional[str] = Query(None), 
    db: Session = Depends(get_db)
):
    """List tasks for authenticated user."""
    user_id = get_current_user_id(request)
    query = db.query(Task).filter(Task.ownerUserID == user_id)
    if q: query = query.filter(Task.title.ilike(f"%{q}%"))
    if status: query = query.filter(Task.status == status)
    return query.order_by(Task.id.desc()).all()

@router.post("/tasks", response_model=TaskOut, status_code=201)
def create_task(
    data: TaskCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Create task for authenticated user."""
    user_id = get_current_user_id(request)
    task_data = data.model_dump()
    task_data['ownerUserID'] = user_id
    obj = Task(**task_data)
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

@router.patch("/tasks/{task_id}", response_model=TaskOut)
def update_task(
    task_id: int,
    data: TaskUpdate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Update task (must be owner)."""
    user_id = get_current_user_id(request)
    obj = db.get(Task, task_id)
    if not obj: 
        raise HTTPException(404, "Task not found")
    if obj.ownerUserID != user_id:
        raise HTTPException(403, "Not authorized")
    
    for k, v in data.model_dump(exclude_unset=True).items(): 
        setattr(obj, k, v)
    db.commit(); db.refresh(obj)
    return obj

@router.delete("/tasks/{task_id}", status_code=204)
def delete_task(
    task_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """Delete task (must be owner)."""
    user_id = get_current_user_id(request)
    obj = db.get(Task, task_id)
    if not obj: 
        raise HTTPException(404, "Task not found")
    if obj.ownerUserID != user_id:
        raise HTTPException(403, "Not authorized")
    
    db.delete(obj); db.commit()
    return None