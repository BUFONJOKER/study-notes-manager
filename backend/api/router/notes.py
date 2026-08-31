from fastapi import APIRouter, Depends, HTTPException, status
from api.schemas import NoteCreate, NoteResponse, NoteUpdate
from api.models import Note
from sqlalchemy.orm import Session
from datetime import datetime
from api.database import SessionLocal

router = APIRouter()


def get_db():
    """Dependency to get a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/{user_name}", response_model=list[NoteResponse])
async def read_notes(user_name: str, db: Session = Depends(get_db)):
    """Check if the user exists in the database."""

    user_notes = db.query(Note).filter(Note.user_name == user_name).all()

    if not user_notes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No notes found for user '{user_name}'.",
        )

    """Retrieve all notes for a specific user."""

    notes = db.query(Note).filter(Note.user_name == user_name).all()

    return notes


@router.post(
    "/create_note", response_model=NoteResponse, status_code=status.HTTP_201_CREATED
)
def create_note(note: NoteCreate, db: Session = Depends(get_db)):
    """Check if a note with the same note_id already exists."""

    existing_note = db.query(Note).filter(Note.note_id == note.note_id).first()
    if existing_note:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Note with note_id '{note.note_id}' already exists.",
        )

    """Create a new note."""
    db_note = Note(
        user_name=note.user_name,
        note_id=note.note_id,
        title=note.title,
        subject=note.subject,
        content=note.content,
        created_at=datetime.now(),
        updated_at=datetime.now(),
    )

    db.add(db_note)
    db.commit()
    db.refresh(db_note)

    return db_note


@router.delete("/delete_note/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id: str, db: Session = Depends(get_db)):
    """Delete an existing note."""
    db_note = db.query(Note).filter(Note.note_id == note_id).first()

    if not db_note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note with note_id '{note_id}' not found.",
        )

    db.delete(db_note)
    db.commit()


@router.put("/update_note/{note_id}", response_model=NoteResponse)
def update_note(note_id: str, note: NoteUpdate, db: Session = Depends(get_db)):
    """Update an existing note."""
    db_note = db.query(Note).filter(Note.note_id == note_id).first()

    if not db_note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note with note_id '{note_id}' not found.",
        )

    db_note.title = note.title
    db_note.subject = note.subject
    db_note.content = note.content
    db_note.updated_at = datetime.now()

    db.commit()
    db.refresh(db_note)

    return db_note
