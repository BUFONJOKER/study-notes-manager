from pydantic import BaseModel

class UserCreate(BaseModel):
    user_name: str
    password: str

class UserUpdate(BaseModel):
    user_name: str | None = None
    password: str | None = None

class UserResponse(BaseModel):
    user_id: int
    user_name: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None