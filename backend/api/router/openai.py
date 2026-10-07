from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated

from api.schemas.openai import OpenAIKeyRequest, OpenAIKeyResponse
from api.utils.context import openai_key_context
from api.utils.auth import get_current_user, get_openai_key
from api.db.models import User

router = APIRouter(prefix="/openai", tags=["openai"])

# Type aliases
CurrentUserDep = Annotated[User, Depends(get_current_user)]
OpenAIKeyDep = Annotated[str, Depends(get_openai_key)]

@router.post("/set-key", response_model=OpenAIKeyResponse)
async def set_openai_key(
    request: OpenAIKeyRequest,
    current_user: CurrentUserDep,  # must be logged in
):
    """Set the OpenAI API key for this request session only. Never stored in DB."""
    if not request.api_key.startswith("sk-"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OpenAI API key format.",
        )
    # Store in context var - only lives for this request
    openai_key_context.set(request.api_key)
    return OpenAIKeyResponse(message="OpenAI API key set successfully for this session.")


@router.get("/validate-key", response_model=OpenAIKeyResponse)
async def validate_key(
    current_user: CurrentUserDep,
    api_key: OpenAIKeyDep,  # gets key from context
):
    """Check if an OpenAI API key is currently set in this session."""
    return OpenAIKeyResponse(message=f"API key is set and starts with: {api_key[:8]}...")