from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.router.notes import router as notes_router
from api.router.users import router as users_router
from api.router.openai import router as openai_router
from config import get_settings

settings = get_settings()

app = FastAPI(
    title="Study Notes Manager",
    description="API for managing study notes.",
    version="1.0.0",
)

origins = [
    "http://localhost:8000" # frontend local URL
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