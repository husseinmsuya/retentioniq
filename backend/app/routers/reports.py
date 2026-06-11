import csv
import io

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.auth import get_current_user_id
from app.database import get_db
from app.models.prediction import PredictionRecord
from app.services.analytics_service import build_summary, serialize_customer

router = APIRouter()


def csv_response(filename: str, rows: list[dict], columns: list[str]):
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=columns)
    writer.writeheader()

    for row in rows:
        writer.writerow({column: row.get(column, "") for column in columns})

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        },
    )


@router.get("/churn")
def churn_risk_report(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    summary = build_summary(db, user_id)

    rows = [
        {"Metric": "Total Customers Analyzed", "Value": summary["totalCustomers"]},
        {"Metric": "High Risk Customers", "Value": summary["highRiskCustomers"]},
        {"Metric": "Critical Risk Customers", "Value": summary["criticalRiskCustomers"]},
        {"Metric": "Expected Churn Rate", "Value": f'{summary["expectedChurnRate"]}%'},
        {"Metric": "Average Risk Score", "Value": f'{summary["averageRiskScore"]}%'},
        {"Metric": "Total Estimated Salary (TZS)", "Value": summary["totalEstimatedSalary"]},
        {"Metric": "Revenue At Risk (TZS)", "Value": summary["revenueAtRisk"]},
        {"Metric": "Low Satisfaction Customers", "Value": summary["lowSatisfactionCustomers"]},
        {"Metric": "Inactive Customers", "Value": summary["inactiveCustomers"]},
    ]

    return csv_response(
        "retentioniq_churn_risk_report.csv",
        rows,
        ["Metric", "Value"],
    )


@router.get("/customers")
def customer_prediction_report(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    rows = (
        db.query(PredictionRecord)
        .filter(PredictionRecord.user_id == user_id)
        .order_by(PredictionRecord.churn_probability.desc())
        .all()
    )

    data = [serialize_customer(row) for row in rows]

    columns = [
        "id",
        "CreditScore",
        "Geography",
        "Gender",
        "Age",
        "Tenure",
        "Balance",
        "NumOfProducts",
        "HasCrCard",
        "IsActiveMember",
        "SatisfactionScore",
        "CardType",
        "PointsEarned",
        "EstimatedSalary",
        "churnProbability",
        "riskLevel",
        "prediction",
        "createdAt",
    ]

    return csv_response(
        "retentioniq_customer_prediction_report.csv",
        data,
        columns,
    )


@router.get("/revenue")
def revenue_at_risk_report(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    rows = (
        db.query(PredictionRecord)
        .filter(PredictionRecord.user_id == user_id)
        .filter(PredictionRecord.churn_probability >= 60)
        .order_by(PredictionRecord.churn_probability.desc())
        .all()
    )

    data = []

    for row in rows:
        revenue_exposure = float(row.estimated_salary or 0) * (
            float(row.churn_probability or 0) / 100
        )

        data.append({
            "id": row.id,
            "Geography": row.geography,
            "Gender": row.gender,
            "Age": row.age,
            "Balance": row.balance,
            "CardType": row.card_type,
            "EstimatedSalary": row.estimated_salary,
            "churnProbability": row.churn_probability,
            "riskLevel": row.risk_level,
            "RevenueExposure": round(revenue_exposure, 2),
            "RecommendedPriority": "Immediate" if row.churn_probability >= 80 else "High",
            "createdAt": row.created_at.isoformat(),
        })

    columns = [
        "id",
        "Geography",
        "Gender",
        "Age",
        "Balance",
        "CardType",
        "EstimatedSalary",
        "churnProbability",
        "riskLevel",
        "RevenueExposure",
        "RecommendedPriority",
        "createdAt",
    ]

    return csv_response(
        "retentioniq_revenue_at_risk_report.csv",
        data,
        columns,
    )