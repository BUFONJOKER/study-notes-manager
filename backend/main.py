from fastapi import FastAPI
from api.router.notes import router as notes_router
from api.router.users import router as users_router
from api.router.openai import router as openai_router
from contextlib import asynccontextmanager
from agent.model.llm import load_llm
from config import get_settings

models = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()

    # Only preload LLM if key exists in .env
    if settings.openai_api_key:
        models["llm"] = load_llm(api_key=settings.openai_api_key)
    else:
        print("Warning: No OPENAI_API_KEY in .env. Users must provide their own key.")

    yield
    models.clear()

settings = get_settings()

app = FastAPI(title="Study Notes Manager", description="API for managing study notes.", version="1.0.0", lifespan=lifespan)

# Add prefix here instead of in include_router
app.include_router(users_router, prefix="/users", tags=["users"])
app.include_router(notes_router, prefix="/notes", tags=["notes"])
app.include_router(openai_router, prefix="/openai", tags=["openai"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)