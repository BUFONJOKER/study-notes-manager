# Location: api/routers/openai.py
from fastapi import APIRouter, Depends, HTTPException, status, Header
from openai import OpenAI, AuthenticationError, APIConnectionError, RateLimitError
from typing import Annotated, Optional

from api.schemas.openai import OpenAIKeyRequest, OpenAIKeyResponse
from api.utils.auth import get_current_user, get_openai_key, OpenAIKeyDep
from api.db.models import User

router = APIRouter(prefix="/openai", tags=["openai"])
CurrentUserDep = Annotated[User, Depends(get_current_user)]

@router.post("/set-key", response_model=OpenAIKeyResponse)
async def set_openai_key(
    request: OpenAIKeyRequest,
    current_user: CurrentUserDep,
):
    """Acknowledge receipt of a user-provided OpenAI API key without storing it."""
    api_key = request.api_key.strip()
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OpenAI API key is required.",
        )
    if not api_key.startswith("sk-"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OpenAI API key format.",
        )

    return OpenAIKeyResponse(
        message="OpenAI API key validated for this session-state loop."
    )


@router.get("/validate-key", response_model=OpenAIKeyResponse)
async def validate_key(
    current_user: CurrentUserDep,
    # --- MODIFIED: Ensure validation relies directly on the incoming Request Header ---
    x_openai_key: Optional[str] = Header(None, alias="X-OpenAI-Key"),
):
    """Validate the supplied key against the official OpenAI API without storing it."""
    if not x_openai_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="X-OpenAI-Key header is missing.",
        )

    client = OpenAI(api_key=x_openai_key)

    try:
        # Minimum execution check to guarantee key validity
        client.models.list()
    except AuthenticationError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid OpenAI API key.",
        ) from exc
    except RateLimitError as exc:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="OpenAI rate limit exceeded. Please try again later.",
        ) from exc
    except APIConnectionError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to reach the OpenAI API.",
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OpenAI validation failed.",
        ) from exc

    return OpenAIKeyResponse(message="OpenAI API key is valid and was not stored.")
