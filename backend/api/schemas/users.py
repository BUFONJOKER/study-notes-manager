from pydantic import BaseModel, Field, SecretStr

class UserCreate(BaseModel):
    user_name: str = Field(..., example="john_doe", description="Name of the user.")
    password: SecretStr = Field(...,min_length=8,description="Password must be at least 8 characters long", example="secure_password")

class UserUpdate(BaseModel):
    user_name: str | None = Field(default=None, example="new_username", description="New name of the user.")
    password: SecretStr = Field(...,min_length=8,description="Password must be at least 8 characters long", example="secure_password")

class UserResponse(BaseModel):
    user_id: int = Field(..., example=1, description="ID of the user which will be generated automatically when the user is created.")
    user_name: str = Field(..., example="john_doe", description="Name of the user.")

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str = Field(..., example="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", description="JWT access token for authentication.")
    token_type: str = Field(..., example="bearer", description="Type of the token.")

class TokenData(BaseModel):
    username: str | None = Field(default=None, example="john_doe", description="Username extracted from the JWT token.")