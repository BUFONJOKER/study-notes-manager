from fastapi import FastAPI
from api.router.notes import router


app = FastAPI(title="Study Notes Manager", description="API for managing study notes.", version="1.0.0")

app.include_router(router, tags=["notes"])



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)