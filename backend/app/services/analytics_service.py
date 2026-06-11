from collections import Counter

from sqlalchemy.orm import Session

from app.models.prediction import PredictionRecord


def serialize_customer(row: PredictionRecord):
    return {
        "id": row.id,
        "CreditScore": row.credit_score,
        "Geography": row.geography,
        "Gender": row.gender,
        "Age": row.age,
        "Tenure": row.tenure,
        "Balance": row.balance,
        "NumOfProducts": row.num_of_products,
        "HasCrCard": row.has_cr_card,
        "IsActiveMember": row.is_active_member,
        "SatisfactionScore": row.satisfaction_score,
        "CardType": row.card_type,
        "PointsEarned": row.points_earned,
        "EstimatedSalary": row.estimated_salary,
        "churnProbability": row.churn_probability,
        "riskLevel": row.risk_level,
        "prediction": row.prediction,
        "createdAt": row.created_at.isoformat(),
    }


def build_summary(db: Session, user_id: str):
    rows = (
        db.query(PredictionRecord)
        .filter(PredictionRecord.user_id == user_id)
        .all()
    )

    total = len(rows)

    if total == 0:
        return {
            "totalCustomers": 0,
            "highRiskCustomers": 0,
            "criticalRiskCustomers": 0,
            "expectedChurnRate": 0,
            "averageRiskScore": 0,
            "totalEstimatedSalary": 0,
            "revenueAtRisk": 0,
            "lowSatisfactionCustomers": 0,
            "inactiveCustomers": 0,
            "geographyBreakdown": {},
            "highRiskGeographyBreakdown": {},
            "cardTypeBreakdown": {},
            "highRiskCardTypeBreakdown": {},
            "genderBreakdown": {},
            "topRiskCustomers": [],
        }

    high_risk = [r for r in rows if float(r.churn_probability or 0) >= 60]
    critical = [r for r in rows if float(r.churn_probability or 0) >= 80]

    total_salary = sum(float(r.estimated_salary or 0) for r in rows)
    revenue_at_risk = sum(
        float(r.estimated_salary or 0) * (float(r.churn_probability or 0) / 100)
        for r in high_risk
    )

    geography = Counter(r.geography for r in rows)
    card_type = Counter(r.card_type for r in rows)
    gender = Counter(r.gender for r in rows)

    high_geo = Counter(r.geography for r in high_risk)
    high_card = Counter(r.card_type for r in high_risk)

    top_risk = sorted(rows, key=lambda r: float(r.churn_probability or 0), reverse=True)[:10]

    return {
        "totalCustomers": total,
        "highRiskCustomers": len(high_risk),
        "criticalRiskCustomers": len(critical),
        "expectedChurnRate": round((len(high_risk) / total) * 100, 2),
        "averageRiskScore": round(
            sum(float(r.churn_probability or 0) for r in rows) / total,
            2,
        ),
        "totalEstimatedSalary": round(total_salary, 2),
        "revenueAtRisk": round(revenue_at_risk, 2),
        "lowSatisfactionCustomers": len([r for r in rows if int(r.satisfaction_score or 0) <= 2]),
        "inactiveCustomers": len([r for r in rows if int(r.is_active_member or 0) == 0]),
        "geographyBreakdown": dict(geography),
        "highRiskGeographyBreakdown": dict(high_geo),
        "cardTypeBreakdown": dict(card_type),
        "highRiskCardTypeBreakdown": dict(high_card),
        "genderBreakdown": dict(gender),
        "topRiskCustomers": [serialize_customer(r) for r in top_risk],
    }