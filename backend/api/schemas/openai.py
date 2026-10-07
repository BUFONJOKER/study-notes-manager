from pydantic import BaseModel

class OpenAIKeyRequest(BaseModel):
    api_key: str

class OpenAIKeyResponse(BaseModel):
    message: str