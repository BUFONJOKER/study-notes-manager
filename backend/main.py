from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.router.notes import router as notes_router
from api.router.users import router as users_router
from api.router.openai import router as openai_router
from agent.model.llm import load_llm
from config import get_settings
from api.utils.state import models


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()

    # Only preload LLM if key exists in .env
    if settings.OPENAI_API_KEY:
        try:
            models["llm"] = load_llm(api_key=settings.OPENAI_API_KEY)
        except Exception as e:
            raise RuntimeError(f"Failed to load LLM: {e}")
    else:
        print("Warning: No OPENAI_API_KEY in .env. Users must provide their own key.")

    yield

    # Cleanup on shutdown
    models.clear()


app = FastAPI(
    title="Study Notes Manager",
    description="API for managing study notes.",
    version="1.0.0",
    lifespan=lifespan,
)

origins = [
    "http://localhost",
    "http://localhost:3000",  # adjust to your actual frontend port
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users_router)
app.include_router(notes_router)
app.include_router(openai_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)