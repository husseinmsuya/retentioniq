from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, Integer, String
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class PredictionRecord(Base):
    __tablename__ = "prediction_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False, default="default")
    file_name = Column(String, nullable=True)

    credit_score = Column(Integer, nullable=False)
    geography = Column(String, nullable=False)
    gender = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    tenure = Column(Integer, nullable=False)
    balance = Column(Float, nullable=False)
    num_of_products = Column(Integer, nullable=False)
    has_cr_card = Column(Integer, nullable=False)
    is_active_member = Column(Integer, nullable=False)
    satisfaction_score = Column(Integer, nullable=False)
    card_type = Column(String, nullable=False)
    points_earned = Column(Integer, nullable=False)
    estimated_salary = Column(Float, nullable=False)

    churn_probability = Column(Float, nullable=False)
    risk_level = Column(String, nullable=False)
    prediction = Column(String, nullable=False)

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )