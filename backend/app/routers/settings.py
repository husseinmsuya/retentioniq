from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.auth import get_current_user_id
from app.database import get_db
from app.models.prediction import PredictionRecord
from app.models.settings import WorkspaceSettings

router = APIRouter()


class ProfilePayload(BaseModel):
    full_name: str
    email: str
    profile_picture_url: str = ""


class AppearancePayload(BaseModel):
    theme: str


def safe_user_file_name(user_id: str):
    return user_id.replace("user_", "").replace("|", "_").replace("/", "_")


def get_or_create_settings(db: Session, user_id: str):
    settings = db.query(WorkspaceSettings).filter(WorkspaceSettings.user_id == user_id).first()

    if settings:
        return settings

    settings = WorkspaceSettings(user_id=user_id)
    db.add(settings)
    db.commit()
    db.refresh(settings)

    return settings


def serialize_settings(settings: WorkspaceSettings, db: Session, user_id: str):
    total_predictions = (
        db.query(PredictionRecord)
        .filter(PredictionRecord.user_id == user_id)
        .count()
    )

    return {
        "id": settings.id,
        "userId": settings.user_id,
        "profile": {
            "fullName": settings.full_name,
            "email": settings.email,
            "profilePictureUrl": settings.profile_picture_url,
        },
        "security": {
            "lastLogin": "Current session",
        },
        "appearance": {
            "theme": settings.theme,
        },
        "system": {
            "productVersion": "RetentionIQ v1.0",
            "model": "XGBoost",
            "totalUploads": settings.total_uploads,
            "totalPredictions": total_predictions,
        },
    }


@router.get("")
def get_settings(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    settings = get_or_create_settings(db, user_id)
    return serialize_settings(settings, db, user_id)


@router.put("/profile")
def update_profile(
    payload: ProfilePayload,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    settings = get_or_create_settings(db, user_id)

    settings.full_name = payload.full_name
    settings.email = payload.email
    settings.profile_picture_url = payload.profile_picture_url

    db.commit()
    db.refresh(settings)

    return {
        "message": "Profile settings saved successfully",
        "settings": serialize_settings(settings, db, user_id),
    }


@router.post("/profile-picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    allowed_suffixes = {".png", ".jpg", ".jpeg", ".webp"}
    original_suffix = Path(file.filename or "profile-picture.png").suffix.lower()
    suffix = original_suffix if original_suffix in allowed_suffixes else ".png"

    upload_dir = Path("app/uploads/profile")
    upload_dir.mkdir(parents=True, exist_ok=True)

    file_name = f"profile-picture-{safe_user_file_name(user_id)}{suffix}"
    file_path = upload_dir / file_name

    content = await file.read()

    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Profile image must be 5MB or smaller")

    file_path.write_bytes(content)

    image_url = f"/uploads/profile/{file_name}"

    settings = get_or_create_settings(db, user_id)
    settings.profile_picture_url = image_url

    db.commit()
    db.refresh(settings)

    return {
        "message": "Profile picture uploaded successfully",
        "profilePictureUrl": image_url,
        "settings": serialize_settings(settings, db, user_id),
    }


@router.put("/appearance")
def update_appearance(
    payload: AppearancePayload,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    settings = get_or_create_settings(db, user_id)
    settings.theme = payload.theme

    db.commit()
    db.refresh(settings)

    return {
        "message": "Appearance settings saved successfully",
        "settings": serialize_settings(settings, db, user_id),
    }


@router.delete("/prediction-history")
def delete_prediction_history(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    deleted = (
        db.query(PredictionRecord)
        .filter(PredictionRecord.user_id == user_id)
        .delete()
    )

    db.commit()

    return {
        "message": "Uploaded prediction data deleted successfully",
        "deletedRecords": deleted,
    }