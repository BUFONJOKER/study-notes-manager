from pydantic import BaseModel, Field

class OpenAIKeyRequest(BaseModel):
    api_key: str = Field(..., example="sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")

class OpenAIKeyResponse(BaseModel):
    message: str = Field(..., example="OpenAI API key stored successfully.")