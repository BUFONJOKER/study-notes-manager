from datetime import datetime, timedelta, timezone
import jwt
from jwt.exceptions import InvalidTokenError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import Annotated

from api.db.database import get_db
from api.db.models import User
from api.schemas.users import TokenData
from api.utils.context import openai_key_context

from fastapi import Depends

from config import get_settings, Settings
from utils.context import openai_key_context

settings = get_settings()

SECRET_KEY = settings.SECRET_KEY  # openssl rand -hex 32
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/login")

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)],
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except InvalidTokenError:
        raise credentials_exception
    user = db.query(User).filter(User.user_name == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user

def get_openai_key(
    settings: Annotated[Settings, Depends(get_settings)]
) -> str:
    """
    Get OpenAI API key in priority order:
    1. Key provided by user in this request (ContextVar)
    2. Key from .env file (fallback)
    """
    # Priority 1: Check ContextVar (user provided key this request)
    key = openai_key_context.get()
    if key:
        return key

    # Priority 2: Fall back to .env key
    if settings.openai_api_key:
        return settings.openai_api_key

    # Neither found
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="No OpenAI API key found. Provide via POST /openai/set-key or set OPENAI_API_KEY in .env",
    )

# OpenAIKeyDep = Annotated[str, Depends(get_openai_key)]