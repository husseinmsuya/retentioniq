from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import engine
from app.models.prediction import Base
from app.models import settings as settings_model
from app.routers import ai, predictions, reports, settings

Base.metadata.create_all(bind=engine)

UPLOAD_DIR = Path("app/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="RetentionIQ API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://retentioniq-three.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

app.include_router(predictions.router, prefix="/predictions", tags=["predictions"])
app.include_router(reports.router, prefix="/reports", tags=["reports"])
app.include_router(settings.router, prefix="/settings", tags=["settings"])
app.include_router(ai.router, prefix="/ai", tags=["ai"])


@app.get("/")
def root():
    return {"message": "RetentionIQ backend is running"}
