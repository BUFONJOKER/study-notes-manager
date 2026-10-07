"""API routes for reading, creating, updating, deleting, and quizzing notes."""

import json, time
from collections.abc import AsyncIterator
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.sse import EventSourceResponse, ServerSentEvent
from typing import Annotated
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from api.schemas.notes import (
    NoteCreate,
    NoteResponse,
    NoteUpdate,
    QuizGenerationResponse,
)
from agent.schemas.main import AgentState
from api.db.database import get_db
from api.db.models import Note, User
from api.db.database import SessionLocal
from api.utils.auth import get_current_user, get_openai_key
from api.utils.context import openai_key_context

from agent.model.llm import load_llm
from agent.workflow import build_workflow

from config import get_settings, Settings
from api.utils.state import models
from langchain_core.callbacks import get_usage_metadata_callback

router = APIRouter(prefix="/notes", tags=["notes"])

GPT_5_NANO_INPUT_USD_PER_MILLION = 0.05
GPT_5_NANO_CACHED_INPUT_USD_PER_MILLION = 0.005
GPT_5_NANO_OUTPUT_USD_PER_MILLION = 0.40

current_user_dep = Annotated[User, Depends(get_current_user)]
OpenAIKeyDep = Annotated[str, Depends(get_openai_key)]
SettingsDep = Annotated[Settings, Depends(get_settings)]
DBDep = Annotated[Session, Depends(get_db)]


def _usage_telemetry(usage_metadata: dict) -> dict:
    """Calculate GPT-5 nano usage and standard API pricing."""
    input_tokens = sum(
        usage.get("input_tokens", 0) for usage in usage_metadata.values()
    )
    output_tokens = sum(
        usage.get("output_tokens", 0) for usage in usage_metadata.values()
    )
    total_tokens = sum(
        usage.get("total_tokens", 0) for usage in usage_metadata.values()
    )
    cached_input_tokens = sum(
        usage.get("input_token_details", {}).get("cache_read", 0)
        for usage in usage_metadata.values()
    )
    uncached_input_tokens = max(input_tokens - cached_input_tokens, 0)
    estimated_cost_usd = (
        (uncached_input_tokens / 1_000_000)
        * GPT_5_NANO_INPUT_USD_PER_MILLION
        + (cached_input_tokens / 1_000_000)
        * GPT_5_NANO_CACHED_INPUT_USD_PER_MILLION
        + (output_tokens / 1_000_000) * GPT_5_NANO_OUTPUT_USD_PER_MILLION
    )
    return {
        "input": input_tokens,
        "cached_input": cached_input_tokens,
        "output": output_tokens,
        "total": total_tokens,
        "estimated_cost_usd": round(estimated_cost_usd, 6),
    }


@router.get("/get_all_names", response_model=list[str])
async def get_all_names(db: DBDep):
    """Return all unique user names that have notes."""

    try:
        user_names = db.query(Note.user_name).distinct().all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    if not user_names:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No user names found in the database.",
        )

    return [name[0] for name in user_names]


@router.get("/{user_id}", response_model=list[NoteResponse])
async def read_notes(user_id: str, db: DBDep, current_user: current_user_dep):
    """Return all notes belonging to a user logged in. This endpoint is protected and requires authentication."""

    try:
        user_notes = db.query(Note).filter(Note.user_id == user_id).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    if not user_notes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No notes found for user '{user_id}'.",
        )

    return user_notes


@router.post(
    "/create_note", response_model=NoteResponse, status_code=status.HTTP_201_CREATED
)
def create_note(request: NoteCreate, db: DBDep, current_user: current_user_dep):
    """Create and save a new note. This endpoint is protected and requires authentication."""

    try:
        existing_note = db.query(Note).filter(Note.note_id == request.note_id).first()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    if existing_note:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Note with note_id '{request.note_id}' already exists.",
        )

    db_note = Note(
        user_id=request.user_id,
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
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    return db_note


@router.delete("/delete_note/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id: str, db: DBDep, current_user: current_user_dep):
    """Delete a note by its ID. This endpoint is protected and requires authentication."""
    try:
        db_note = db.query(Note).filter(Note.note_id == note_id).first()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

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
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.put("/update_note/{note_id}", response_model=NoteResponse)
def update_note(
    note_id: str, request: NoteUpdate, db: DBDep, current_user: current_user_dep
):
    """Update a note's title, subject, and content. This endpoint is protected and requires authentication."""
    try:
        db_note = db.query(Note).filter(Note.note_id == note_id).first()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

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
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

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
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# ✅ Set response_class on the decorator, use yield directly
@router.post("/quiz_generation/{note_id}", response_class=EventSourceResponse)
async def quiz_generation(
    note_id: str,
    db: DBDep,
    current_user: current_user_dep,
    api_key: OpenAIKeyDep,
) -> AsyncIterator[ServerSentEvent]:
    """Generate a quiz and stream workflow updates. Protected endpoint."""
    try:
        db_note = db.query(Note).filter(Note.note_id == note_id).first()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    if not db_note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note with note_id '{note_id}' not found.",
        )

    initial_state = _initial_agent_state(db_note)
    llm = models.get("llm") if openai_key_context.get() is None else load_llm(api_key)
    workflow = build_workflow(llm).compile()

    result = initial_state.model_dump()
    start_time = time.perf_counter()

    try:
        with get_usage_metadata_callback() as usage_callback:
            async for update in workflow.astream(
                initial_state.model_dump(), stream_mode="updates"
            ):
                for node_name, node_update in update.items():
                    result.update(node_update)
                    yield ServerSentEvent(
                        event="workflow_update",
                        data={"node": node_name, "data": node_update},
                    )
        execution_time = time.perf_counter() - start_time

        result["telemetry"] = {
            "execution_time_seconds": round(execution_time, 4),
            "tokens": _usage_telemetry(usage_callback.usage_metadata),
        }
        _save_quiz(db, db_note, result)

        response_data = QuizGenerationResponse(
            **result, user_id=db_note.user_id
        ).model_dump()

        yield ServerSentEvent(event="complete", data=response_data)

    except Exception as e:
        yield ServerSentEvent(event="error", data={"error": str(e)})
