from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Annotated
from datetime import timedelta

from api.db.database import get_db
from api.db.models import User, Note
from api.schemas.users import UserCreate, UserUpdate, UserResponse, Token
from api.utils.auth import (
    create_access_token,
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)

router = APIRouter(prefix="/users", tags=["users"])

# --- Login ---
@router.post("/login", response_model=Token)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[Session, Depends(get_db)],
):
    """Authenticate user and return access token which is valid for 30 minutes and which can be used to access protected endpoints."""
    # Find user by username
    user = db.query(User).filter(User.user_name == form_data.username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # Use your model's verify_password method
    if not user.verify_password(form_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        data={"sub": user.user_name},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return Token(access_token=access_token, token_type="bearer")

# --- Create User ---
@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    db: Annotated[Session, Depends(get_db)],
):
    """Create a new user. This endpoint is open to anyone."""
    existing_user = db.query(User).filter(User.user_name == user_data.user_name).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists",
        )
    new_user = User(user_name=user_data.user_name)
    new_user.password = user_data.password  # Uses your password setter
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# --- Get All Users ---
@router.get("/", response_model=list[UserResponse])
async def get_all_users(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],  # protected
):
    """Get all users data protected"""
    return db.query(User).all()

# --- Get Single User ---
@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],  # protected
):
    """Get user Notes data protected."""
    user = db.query(User).filter(User.user_id == user_id).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    note = db.query(Note).filter(Note.user_id == user_id).first()

    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No notes found for this user")

    return note

# --- Update User ---
@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],  # protected
):
    """Update user data"""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user_data.user_name:
        user.user_name = user_data.user_name
    if user_data.password:
        user.password = user_data.password  # Uses your password setter
    db.commit()
    db.refresh(user)
    return user

# --- Delete User ---
@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],  # protected
):
    """Delete user data"""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    db.delete(user)
    db.commit()