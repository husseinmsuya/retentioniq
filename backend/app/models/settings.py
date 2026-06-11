from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String

from app.models.prediction import Base


class WorkspaceSettings(Base):
    __tablename__ = "workspace_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, unique=True, index=True, default="default")

    full_name = Column(String, default="RetentionIQ Admin")
    email = Column(String, default="admin@retentioniq.ai")
    profile_picture_url = Column(String, default="")

    theme = Column(String, default="Dark Mode")

    total_uploads = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)