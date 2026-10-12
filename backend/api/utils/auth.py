from datetime import datetime, timedelta, timezone
import jwt
from jwt.exceptions import InvalidTokenError
from fastapi import Depends, HTTPException, Query, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import Annotated

from api.db.database import get_db
from api.db.models import User
from api.schemas.users import TokenData

from config import get_settings, Settings


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
    request: Request,
    settings: Annotated[Settings, Depends(get_settings)],
) -> str:
    """Use request-scoped keys in normal operation, but allow a dev-only env fallback.

    In non-production environments, a configured .env OPENAI_API_KEY can act as a
    convenience fallback for local testing. In production, only the request header
    is accepted to avoid cross-user leakage and secret persistence.
    """
    key = request.headers.get("X-OpenAI-API-Key")
    if key is not None:
        trimmed = key.strip()
        if trimmed:
            return trimmed

    if settings.APP_ENV != "production" and settings.OPENAI_API_KEY:
        return settings.OPENAI_API_KEY.strip()

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="OpenAI API key is required in the X-OpenAI-API-Key header.",
    )


OpenAIKeyDep = Annotated[str, Depends(get_openai_key)]