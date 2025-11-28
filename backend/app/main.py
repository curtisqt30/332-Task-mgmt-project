from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from app.core.db import Base, engine
from app.api.routes_auth import router as auth_router
from app.api.routes_tasks import router as tasks_router
from app.api.routes_teams import router as teams_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Task Manager API")

app.add_middleware(SessionMiddleware, secret_key="simple-secret-key")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True
)

app.include_router(auth_router, prefix="/api/auth")
app.include_router(tasks_router, prefix="/api")
app.include_router(teams_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Task Manager API"}