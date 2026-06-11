import os
from functools import lru_cache
from pydantic import BaseModel
from dotenv import load_dotenv

class Settings(BaseModel):
    database_url: str = os.getenv("DATABASE_URL", "postgresql+psycopg://neondb_owner:npg_qY3yKcAPu0Ce@ep-morning-mountain-aqnpo1w9-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require")
    jwt_secret: str = os.getenv("JWT_SECRET", "change-me")
    groq_api_key: str | None = os.getenv("GROQ_API_KEY")
    model_path: str = os.getenv("MODEL_PATH", "app/models/churn_model.pkl")
    scaler_path: str = os.getenv("SCALER_PATH", "app/models/scaler.sav")
    feature_columns_path: str = os.getenv("FEATURE_COLUMNS_PATH", "app/models/feature_columns.json")
@lru_cache
def get_settings() -> Settings:
    return Settings()
