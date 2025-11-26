from pydantic import BaseModel, ConfigDict


class UserRegister(BaseModel):
    userName: str
    password: str


class UserLogin(BaseModel):
    userName: str
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    userID: int
    userName: str


class LoginResponse(BaseModel):
    user: UserOut
