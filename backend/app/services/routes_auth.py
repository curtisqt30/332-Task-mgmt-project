from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.core.db import SessionLocal
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, LoginResponse, UserOut
from app.services.auth_service import hash_password, verify_password

router = APIRouter(tags=["auth"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/register", response_model=LoginResponse, status_code=201)
def register(data: UserRegister, request: Request, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if username exists
    existing = db.query(User).filter(User.userName == data.userName).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create user
    hashed = hash_password(data.password)
    user = User(userName=data.userName, passHash=hashed)
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Store user_id in session
    request.session["user_id"] = user.userID
    
    return LoginResponse(user=UserOut(userID=user.userID, userName=user.userName))


@router.post("/login", response_model=LoginResponse)
def login(data: UserLogin, request: Request, db: Session = Depends(get_db)):
    """Login user."""
    # Find user
    user = db.query(User).filter(User.userName == data.userName).first()
    if not user or not verify_password(data.password, user.passHash):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    # Store user_id in session
    request.session["user_id"] = user.userID
    
    return LoginResponse(user=UserOut(userID=user.userID, userName=user.userName))


@router.get("/me", response_model=UserOut)
def get_current_user(request: Request, db: Session = Depends(get_db)):
    """Get current user."""
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user


@router.post("/logout")
def logout(request: Request):
    """Logout user."""
    request.session.clear()
    return {"message": "Logged out"}


def get_current_user_id(request: Request) -> int:
    """Get current user ID from session."""
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user_id