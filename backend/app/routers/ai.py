from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.auth import get_current_user_id
from app.database import get_db
from app.services.analytics_service import build_summary
from app.services.groq_service import generate_insight

router = APIRouter()


class InsightRequest(BaseModel):
    question: str


@router.post("/insights")
def insights(
    payload: InsightRequest,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    context = build_summary(db, user_id)
    return generate_insight(payload.question, context)