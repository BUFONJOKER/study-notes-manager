from collections.abc import AsyncIterator, AsyncIterable
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
import json

from api.schemas import NoteCreate, NoteResponse, NoteUpdate, QuizGenerationResponse
from api.models import Note
from sqlalchemy.orm import Session
from datetime import datetime
from api.database import SessionLocal
from agent.model.llm import load_llm
from agent.schemas.main import AgentState
from agent.workflow import build_workflow

router = APIRouter()


def get_db():
    """Dependency to get a database session."""
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f'Database error: {str(e)}')
    finally:
        db.close()

@router.get("/get_all_names", response_model=list[str])
async def get_all_names(db: Session = Depends(get_db)):
    """Get all unique user names from the database."""
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
async def read_notes(user_name: str, db: Session = Depends(get_db)):
    """Check if the user exists in the database."""

    try:
        user_notes = db.query(Note).filter(Note.user_name == user_name).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Database error: {str(e)}')

    if not user_notes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No notes found for user '{user_name}'.",
        )

    """Retrieve all notes for a specific user."""

    try:
        notes = db.query(Note).filter(Note.user_name == user_name).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Database error: {str(e)}')

    return notes


@router.post(
    "/create_note", response_model=NoteResponse, status_code=status.HTTP_201_CREATED
)
def create_note(note: NoteCreate, db: Session = Depends(get_db)):
    """Check if a note with the same note_id already exists."""

    try:
        existing_note = db.query(Note).filter(Note.note_id == note.note_id).first()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Database error: {str(e)}')

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

    try:
        db.add(db_note)
        db.commit()
        db.refresh(db_note)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f'Database error: {str(e)}')

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

    try:
        db.delete(db_note)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f'Database error: {str(e)}')


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

    try:
        db.commit()
        db.refresh(db_note)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f'Database error: {str(e)}')

    return db_note


def _initial_agent_state(db_note: Note) -> AgentState:
    return AgentState(
        note_id=db_note.note_id,
        note_title=db_note.title,
        note_subject=db_note.subject,
        note_content=db_note.content,
    )


def _save_quiz(db: Session, db_note: Note, result: dict) -> None:
    db_note.quiz = json.dumps(result["generated_questions"])
    try:
        db_note.updated_at = datetime.now()
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f'Database error: {str(e)}')


# @router.post("/quiz_generation/{note_id}", response_model=QuizGenerationResponse)
# async def quiz_generation(note_id: str, db: Session = Depends(get_db)):
#     """Run the complete analysis workflow and save the generated quiz."""
#     db_note = db.query(Note).filter(Note.note_id == note_id).first()

#     if not db_note:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail=f"Note with note_id '{note_id}' not found.",
#         )

#     initial_state = _initial_agent_state(db_note)
#     workflow = build_workflow(load_llm()).compile()
#     result = await workflow.ainvoke(initial_state.model_dump())

#     _save_quiz(db, db_note, result)

#     return QuizGenerationResponse(
#         note_id=db_note.note_id,
#         analysis_result=result["analysis_result"],
#         summary_result=result["summary_result"],
#         key_concepts=result["key_concepts"],
#         generated_questions=result["generated_questions"],
#     )


@router.post("/quiz_generation/{note_id}")
async def quiz_generation(note_id: str, db: Session = Depends(get_db)):
    """Run the workflow and stream each completed node as server-sent events."""

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
    workflow = build_workflow(load_llm()).compile()

    async def event_stream() -> AsyncIterator[str]:
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