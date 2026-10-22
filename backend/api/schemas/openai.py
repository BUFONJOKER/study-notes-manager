"""
Schemas for OpenAI-related data structures.
"""

from pydantic import BaseModel, Field

class OpenAIKeyRequest(BaseModel):
    """Schema for storing OpenAI API key."""
    api_key: str = Field(..., example="sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")

class OpenAIKeyResponse(BaseModel):
    """Schema for OpenAI API key storage response."""
    message: str = Field(..., example="OpenAI API key stored successfully.")