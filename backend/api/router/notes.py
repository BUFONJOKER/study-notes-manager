"""API routes for reading, creating, updating, deleting, and quizzing notes."""

from collections.abc import AsyncIterator, AsyncIterable
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
import json

from api.schemas.notes import NoteCreate, NoteResponse, NoteUpdate, QuizGenerationResponse
from api.db.models import Note, User
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from api.db.database import SessionLocal
from agent.model.llm import load_llm
from agent.schemas.main import AgentState
from agent.workflow import build_workflow
from typing import Annotated

from api.utils.auth import get_current_user, get_openai_key
from api.utils.context import openai_key_context
from config import get_settings, Settings
from main import models

router = APIRouter(prefix="/notes", tags=["notes"])

current_user_dep = Annotated[User, Depends(get_current_user)]
OpenAIKeyDep = Annotated[str, Depends(get_openai_key)]
SettingsDep = Annotated[Settings, Depends(get_settings)]

def get_db():
    """Provide a database session and close it after the request."""
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f'Database error: {str(e)}')
    finally:
        db.close()

DBDep = Annotated[Session, Depends(get_db)]

@router.get("/get_all_names", response_model=list[str])
async def get_all_names(db: DBDep):
    """Return all unique user names that have notes."""

    try:
        user_names = db.query(Note.user_name).distinct().all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Database error: {str(e)}')

    if not user_names:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No user names found in the database.",
        )

    return [name[0] for name in user_names]




@router.get("/{user_name}", response_model=list[NoteResponse])
async def read_notes(user_name: str, db: DBDep):
    """Return all notes belonging to a user."""

    try:
        user_notes = db.query(Note).filter(Note.user_name == user_name).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Database error: {str(e)}')

    if not user_notes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No notes found for user '{user_name}'.",
        )

    return user_notes




@router.post(
    "/create_note", response_model=NoteResponse, status_code=status.HTTP_201_CREATED
)
def create_note(request: NoteCreate, db: DBDep, current_user: current_user_dep):
    """Create and save a new note."""

    try:
        existing_note = db.query(Note).filter(Note.note_id == request.note_id).first()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Database error: {str(e)}')

    if existing_note:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Note with note_id '{request.note_id}' already exists.",
        )

    db_note = Note(
        user_name=request.user_name,
        note_id=request.note_id,
        title=request.title,
        subject=request.subject,
        content=request.content,
        created_at=datetime.now(),
        updated_at=datetime.now(),
    )

    try:
        db.add(db_note)
        db.commit()
        db.refresh(db_note)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f'Database error: {str(e)}')

    return db_note




@router.delete("/delete_note/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id: str, db: DBDep, current_user: current_user_dep):
    """Delete a note by its ID."""
    try:
        db_note = db.query(Note).filter(Note.note_id == note_id).first()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Database error: {str(e)}')

    if not db_note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note with note_id '{note_id}' not found.",
        )

    try:
        db.delete(db_note)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f'Database error: {str(e)}')



@router.put("/update_note/{note_id}", response_model=NoteResponse)
def update_note(note_id: str, request: NoteUpdate, db: DBDep):
    """Update a note's title, subject, and content."""
    try:
        db_note = db.query(Note).filter(Note.note_id == note_id).first()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Database error: {str(e)}')

    if not db_note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note with note_id '{note_id}' not found.",
        )

    db_note.title = request.title
    db_note.subject = request.subject
    db_note.content = request.content
    db_note.updated_at = datetime.now(timezone.utc)

    try:
        db.commit()
        db.refresh(db_note)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f'Database error: {str(e)}')

    return db_note


def _initial_agent_state(db_note: Note) -> AgentState:
    """Build the workflow state from a database note."""
    return AgentState(
        note_id=db_note.note_id,
        note_title=db_note.title,
        note_subject=db_note.subject,
        note_content=db_note.content,
    )


def _save_quiz(db: Session, db_note: Note, result: dict) -> None:
    """Save generated quiz questions to a note."""
    db_note.quiz = json.dumps(result["generated_questions"])
    try:
        db_note.updated_at = datetime.now()
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f'Database error: {str(e)}')


@router.post("/quiz_generation/{note_id}")
async def quiz_generation(note_id: str, db: DBDep, current_user: current_user_dep, api_key:OpenAIKeyDep):
    """Generate a quiz and stream workflow updates to the client."""
    try:
        db_note = db.query(Note).filter(Note.note_id == note_id).first()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Database error: {str(e)}')

    if not db_note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note with note_id '{note_id}' not found.",
        )

    initial_state = _initial_agent_state(db_note)
    llm = models.get("llm") if openai_key_context.get() is None else load_llm(api_key)
    workflow = build_workflow(llm).compile()

    async def event_stream() -> AsyncIterator[str]:
        """Yield workflow updates and the completed quiz as server-sent events."""
        result = initial_state.model_dump()

        async for update in workflow.astream(
            initial_state.model_dump(), stream_mode="updates"
        ):
            for node_name, node_update in update.items():
                result.update(node_update)
                yield (
                    "event: workflow_update\n"
                    f"data: {json.dumps({'node': node_name, 'data': node_update})}\n\n"
                )

        _save_quiz(db, db_note, result)
        yield (
            "event: complete\n"
            f"data: {json.dumps(QuizGenerationResponse(**result).model_dump())}\n\n"
        )

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )