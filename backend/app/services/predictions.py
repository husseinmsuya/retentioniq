from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import pandas as pd
import io
import csv

from app.database import get_db
from app.models.prediction import PredictionRecord
from app.services.analytics_service import build_summary, serialize_customer
from app.services.model_service import predict_dataframe

router = APIRouter()

REQUIRED_COLUMNS = [
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
]


def to_int(value, default: int = 0) -> int:
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return default


def to_float(value, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


@router.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    content = await file.read()

    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid CSV file")

    missing = [col for col in REQUIRED_COLUMNS if col not in df.columns]

    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required columns: {missing}",
        )

    df = df[REQUIRED_COLUMNS]

    try:
        prediction_output = predict_dataframe(df)
        predictions = prediction_output["customers"]
        data_quality_report = prediction_output["dataQualityReport"]
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(error)}")

    db.query(PredictionRecord).delete()
    db.commit()

    saved_rows = []

    for item in predictions:
        row = PredictionRecord(
            file_name=file.filename,
            credit_score=to_int(item.get("CreditScore")),
            geography=str(item.get("Geography", "")),
            gender=str(item.get("Gender", "")),
            age=to_int(item.get("Age")),
            tenure=to_int(item.get("Tenure")),
            balance=to_float(item.get("Balance")),
            num_of_products=to_int(item.get("NumOfProducts")),
            has_cr_card=to_int(item.get("HasCrCard")),
            is_active_member=to_int(item.get("IsActiveMember")),
            satisfaction_score=to_int(item.get("SatisfactionScore")),
            card_type=str(item.get("CardType", "")),
            points_earned=to_int(item.get("PointsEarned")),
            estimated_salary=to_float(item.get("EstimatedSalary")),
            churn_probability=to_float(item.get("churnProbability")),
            risk_level=str(item.get("riskLevel", "")),
            prediction=str(item.get("prediction", "")),
        )

        db.add(row)
        saved_rows.append(row)

    db.commit()

    for row in saved_rows:
        db.refresh(row)

    summary = build_summary(db)

    return {
        "status": "success",
        "message": "Dataset successfully processed",
        "customersImported": len(saved_rows),
        "predictionsGenerated": len(saved_rows),
        "highRiskCustomers": summary["highRiskCustomers"],
        "estimatedRevenueAtRisk": summary["revenueAtRisk"],
        "dataQualityReport": data_quality_report,
        "customers": [serialize_customer(row) for row in saved_rows],
        "summary": summary,
    }


@router.get("/summary")
def get_summary(db: Session = Depends(get_db)):
    return build_summary(db)


@router.get("/customers")
def get_customers(db: Session = Depends(get_db)):
    rows = (
        db.query(PredictionRecord)
        .order_by(PredictionRecord.churn_probability.desc())
        .all()
    )

    return {
        "customers": [serialize_customer(row) for row in rows]
    }


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


@router.get("/reports/churn")
def churn_risk_report(db: Session = Depends(get_db)):
    summary = build_summary(db)

    rows = [
        {"Metric": "Total Customers Analyzed", "Value": summary["totalCustomers"]},
        {"Metric": "High Risk Customers", "Value": summary["highRiskCustomers"]},
        {"Metric": "Critical Risk Customers", "Value": summary["criticalRiskCustomers"]},
        {"Metric": "Expected Churn Rate", "Value": f'{summary["expectedChurnRate"]}%'},
        {"Metric": "Average Risk Score", "Value": f'{summary["averageRiskScore"]}%'},
        {"Metric": "Total Estimated Salary", "Value": summary["totalEstimatedSalary"]},
        {"Metric": "Revenue At Risk", "Value": summary["revenueAtRisk"]},
        {"Metric": "Low Satisfaction Customers", "Value": summary["lowSatisfactionCustomers"]},
        {"Metric": "Inactive Customers", "Value": summary["inactiveCustomers"]},
    ]

    return csv_response(
        "retentioniq_churn_risk_report.csv",
        rows,
        ["Metric", "Value"],
    )


@router.get("/reports/customers")
def customer_prediction_report(db: Session = Depends(get_db)):
    rows = (
        db.query(PredictionRecord)
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


@router.get("/reports/revenue")
def revenue_at_risk_report(db: Session = Depends(get_db)):
    rows = (
        db.query(PredictionRecord)
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


@router.get("/customers/{customer_id}")
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    row = db.query(PredictionRecord).filter(PredictionRecord.id == customer_id).first()

    if not row:
        raise HTTPException(status_code=404, detail="Customer not found")

    return serialize_customer(row)


@router.delete("/customers/{customer_id}")
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    row = db.query(PredictionRecord).filter(PredictionRecord.id == customer_id).first()

    if not row:
        raise HTTPException(status_code=404, detail="Customer not found")

    db.delete(row)
    db.commit()

    return {"message": "Customer deleted successfully"}