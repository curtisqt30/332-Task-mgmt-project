from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List
from datetime import date, datetime
import random

from app.core.db import SessionLocal
from app.models.team import Team
from app.models.membership import Membership
from app.models.user import User
from app.models.task import Task
from app.models.assignment import Assignment
from app.api.routes_auth import get_current_user_id

router = APIRouter(tags=["teams"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def generate_join_code() -> str:
    chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    return "".join(random.choice(chars) for _ in range(6))


def parse_date(date_str: str | None) -> date | None:
    """Parse date string to date object."""
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return None


# ============ TEAMS ============

@router.get("/teams")
def list_my_teams(request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request)
    memberships = db.query(Membership).filter(Membership.userID == user_id).all()
    team_ids = [m.teamID for m in memberships]
    if not team_ids:
        return []
    teams = db.query(Team).filter(Team.teamID.in_(team_ids)).all()
    return [{"teamID": t.teamID, "teamName": t.teamName, "joinCode": t.joinCode} for t in teams]


@router.post("/teams", status_code=201)
def create_team(data: dict, request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request)
    code = generate_join_code()
    team = Team(teamName=data["teamName"], joinCode=code, creatorID=user_id)
    db.add(team)
    db.flush()
    membership = Membership(userID=user_id, teamID=team.teamID, role="owner")
    db.add(membership)
    db.commit()
    return {"teamID": team.teamID, "teamName": team.teamName, "joinCode": code}


@router.get("/teams/{team_id}")
def get_team(team_id: int, request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request)
    membership = db.query(Membership).filter(
        Membership.teamID == team_id, Membership.userID == user_id
    ).first()
    if not membership:
        raise HTTPException(403, "Not a member")
    team = db.get(Team, team_id)
    if not team:
        raise HTTPException(404, "Team not found")
    
    members = db.query(Membership, User).join(User, Membership.userID == User.userID).filter(
        Membership.teamID == team_id
    ).all()
    
    return {
        "teamID": team.teamID,
        "teamName": team.teamName,
        "joinCode": team.joinCode,
        "members": [{"userID": u.userID, "userName": u.userName, "role": m.role} for m, u in members]
    }


@router.post("/teams/join")
def join_team(data: dict, request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request)
    team = db.query(Team).filter(Team.joinCode == data["joinCode"].upper()).first()
    if not team:
        raise HTTPException(404, "Team not found")
    existing = db.query(Membership).filter(
        Membership.userID == user_id, Membership.teamID == team.teamID
    ).first()
    if existing:
        raise HTTPException(400, "Already a member")
    membership = Membership(userID=user_id, teamID=team.teamID, role="member")
    db.add(membership)
    db.commit()
    return {"teamID": team.teamID, "teamName": team.teamName}


@router.get("/teams/{team_id}/members")
def get_members(team_id: int, request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request)
    if not db.query(Membership).filter(Membership.teamID == team_id, Membership.userID == user_id).first():
        raise HTTPException(403, "Not a member")
    members = db.query(Membership, User).join(User, Membership.userID == User.userID).filter(
        Membership.teamID == team_id
    ).all()
    return [{"userID": u.userID, "userName": u.userName, "role": m.role} for m, u in members]


# ============ TEAM TASKS ============

@router.get("/teams/{team_id}/tasks")
def list_team_tasks(team_id: int, request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request)
    if not db.query(Membership).filter(Membership.teamID == team_id, Membership.userID == user_id).first():
        raise HTTPException(403, "Not a member")
    
    tasks = db.query(Task).filter(Task.ownerTeamID == team_id).order_by(Task.id.desc()).all()
    result = []
    for t in tasks:
        assignees = db.query(Assignment, User).join(User, Assignment.userID == User.userID).filter(
            Assignment.taskID == t.id
        ).all()
        result.append({
            "id": t.id, "title": t.title, "description": t.description,
            "status": t.status.value if t.status else "Pending", "due": str(t.due) if t.due else None,
            "assignees": [{"userID": u.userID, "userName": u.userName} for _, u in assignees]
        })
    return result


@router.post("/teams/{team_id}/tasks", status_code=201)
def create_team_task(team_id: int, data: dict, request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request)
    if not db.query(Membership).filter(Membership.teamID == team_id, Membership.userID == user_id).first():
        raise HTTPException(403, "Not a member")
    
    task = Task(
        title=data["title"],
        description=data.get("description"),
        due=parse_date(data.get("due")),
        ownerTeamID=team_id,
        ownerUserID=None
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return {"id": task.id, "title": task.title, "status": task.status.value if task.status else "Pending"}


@router.patch("/teams/{team_id}/tasks/{task_id}")
def update_team_task(team_id: int, task_id: int, data: dict, request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request)
    if not db.query(Membership).filter(Membership.teamID == team_id, Membership.userID == user_id).first():
        raise HTTPException(403, "Not a member")
    task = db.get(Task, task_id)
    if not task or task.ownerTeamID != team_id:
        raise HTTPException(404, "Task not found")
    
    for k, v in data.items():
        if k == "due":
            v = parse_date(v)
        if hasattr(task, k):
            setattr(task, k, v)
    db.commit()
    return {"id": task.id, "title": task.title, "status": task.status.value if task.status else "Pending"}


@router.delete("/teams/{team_id}/tasks/{task_id}", status_code=204)
def delete_team_task(team_id: int, task_id: int, request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request)
    if not db.query(Membership).filter(Membership.teamID == team_id, Membership.userID == user_id).first():
        raise HTTPException(403, "Not a member")
    task = db.get(Task, task_id)
    if not task or task.ownerTeamID != team_id:
        raise HTTPException(404, "Task not found")
    db.query(Assignment).filter(Assignment.taskID == task_id).delete()
    db.delete(task)
    db.commit()


# ============ ASSIGNMENTS ============

@router.post("/teams/{team_id}/tasks/{task_id}/assign")
def assign_user(team_id: int, task_id: int, data: dict, request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request)
    if not db.query(Membership).filter(Membership.teamID == team_id, Membership.userID == user_id).first():
        raise HTTPException(403, "Not a member")
    if not db.query(Membership).filter(Membership.teamID == team_id, Membership.userID == data["userID"]).first():
        raise HTTPException(400, "Target user not in team")
    task = db.get(Task, task_id)
    if not task or task.ownerTeamID != team_id:
        raise HTTPException(404, "Task not found")
    existing = db.query(Assignment).filter(Assignment.taskID == task_id, Assignment.userID == data["userID"]).first()
    if existing:
        return {"message": "Already assigned"}
    assignment = Assignment(taskID=task_id, userID=data["userID"])
    db.add(assignment)
    db.commit()
    return {"message": "Assigned"}


@router.delete("/teams/{team_id}/tasks/{task_id}/assign/{assignee_id}")
def unassign_user(team_id: int, task_id: int, assignee_id: int, request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request)
    if not db.query(Membership).filter(Membership.teamID == team_id, Membership.userID == user_id).first():
        raise HTTPException(403, "Not a member")
    db.query(Assignment).filter(Assignment.taskID == task_id, Assignment.userID == assignee_id).delete()
    db.commit()
    return {"message": "Unassigned"}