from pydantic import BaseModel, Field

class NoteCreate(BaseModel):
    """Schema for creating a new note."""
    note_id: int = Field(..., example="note_123")
    title: str = Field(..., example="My Note Title")
    subject: str = Field(..., example="My Note Subject")
    content: str = Field(..., example="This is the content of my note.")

class NoteUpdate(BaseModel):
    """Schema for updating an existing note."""
    title: str = Field(..., example="Updated Note Title")
    subject: str = Field(..., example="Updated Note Subject")
    content: str = Field(..., example="This is the updated content of my note.")

class NoteResponse(BaseModel):
    """Schema for returning note data in responses."""
    note_id: int = Field(..., example="note_123")
    title: str = Field(..., example="My Note Title")
    subject: str = Field(..., example="My Note Subject")
    content: str = Field(..., example="This is the content of my note.")
    created_at: str = Field(..., example="2023-01-01T12:00:00Z")
    updated_at: str = Field(..., example="2023-01-02T12:00:00Z")

    class Config:
        from_attributes = True