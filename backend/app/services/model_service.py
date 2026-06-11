from pathlib import Path
import os
import joblib
import pandas as pd

MODEL_PATH = os.getenv("MODEL_PATH", "app/models/churn_model.pkl")
SCALER_PATH = os.getenv("SCALER_PATH", "app/models/scaler.sav")

RAW_COLUMNS = [
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

TRAINING_RENAME_MAP = {
    "SatisfactionScore": "Satisfaction Score",
    "CardType": "Card Type",
    "PointsEarned": "Point Earned",
}

CATEGORICAL_COLUMNS = ["Geography", "Gender", "Card Type"]

NUMERIC_COLUMNS = [
    "CreditScore",
    "Age",
    "Tenure",
    "Balance",
    "NumOfProducts",
    "HasCrCard",
    "IsActiveMember",
    "Satisfaction Score",
    "Point Earned",
    "EstimatedSalary",
]

UPLOAD_NUMERIC_COLUMNS = [
    "CreditScore",
    "Age",
    "Tenure",
    "Balance",
    "NumOfProducts",
    "HasCrCard",
    "IsActiveMember",
    "SatisfactionScore",
    "PointsEarned",
    "EstimatedSalary",
]

UPLOAD_CATEGORICAL_COLUMNS = ["Geography", "Gender", "CardType"]


def risk_level(probability: float) -> str:
    if probability >= 80:
        return "Critical"
    if probability >= 60:
        return "High"
    if probability >= 40:
        return "Medium"
    return "Low"


def load_artifacts():
    model_file = Path(MODEL_PATH)
    scaler_file = Path(SCALER_PATH)

    if not model_file.exists():
        raise FileNotFoundError(f"Model not found at {MODEL_PATH}")

    if not scaler_file.exists():
        raise FileNotFoundError(f"Scaler not found at {SCALER_PATH}")

    model = joblib.load(model_file)
    scaler = joblib.load(scaler_file)

    if hasattr(scaler, "feature_names_in_"):
        feature_columns = list(scaler.feature_names_in_)
    else:
        raise ValueError(
            "Scaler does not contain feature_names_in_. "
            "You must provide feature_columns.json or re-save scaler with feature names."
        )

    return model, scaler, feature_columns


def validate_raw_columns(df: pd.DataFrame):
    missing = [col for col in RAW_COLUMNS if col not in df.columns]

    if missing:
        raise ValueError(f"Missing required columns: {missing}")


def normalize_missing_markers(df: pd.DataFrame) -> pd.DataFrame:
    return df.replace(
        ["", " ", "nan", "NaN", "None", "none", "NULL", "null", None],
        pd.NA,
    )


def build_data_quality_report(df: pd.DataFrame):
    validate_raw_columns(df)

    checked = normalize_missing_markers(df.copy())
    missing_values = {}

    for col in RAW_COLUMNS:
        count = int(checked[col].isna().sum())
        if count > 0:
            missing_values[col] = count

    return {
        "rowsProcessed": int(len(df)),
        "missingValuesDetected": bool(missing_values),
        "missingValues": missing_values,
        "message": (
            "Missing values were automatically handled before prediction."
            if missing_values
            else "No missing values detected."
        ),
    }


def impute_missing_values(df: pd.DataFrame) -> pd.DataFrame:
    df = normalize_missing_markers(df.copy())

    for col in UPLOAD_CATEGORICAL_COLUMNS:
        mode_value = df[col].dropna().mode()
        fallback = mode_value.iloc[0] if not mode_value.empty else "Unknown"
        df[col] = df[col].fillna(fallback)

    for col in UPLOAD_NUMERIC_COLUMNS:
        numeric_values = pd.to_numeric(df[col], errors="coerce")
        median_value = numeric_values.median()
        fallback = median_value if pd.notna(median_value) else 0
        df[col] = numeric_values.fillna(fallback)

    return df


def normalize_values(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df = df.rename(columns=TRAINING_RENAME_MAP)

    df["Geography"] = df["Geography"].astype(str).str.strip().str.title()
    df["Gender"] = df["Gender"].astype(str).str.strip().str.title()
    df["Card Type"] = df["Card Type"].astype(str).str.strip().str.upper()

    for col in NUMERIC_COLUMNS:
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    return df


def build_model_features(df: pd.DataFrame, feature_columns: list[str]) -> pd.DataFrame:
    validate_raw_columns(df)

    clean = normalize_values(df)

    encoded = pd.get_dummies(
        clean,
        columns=CATEGORICAL_COLUMNS,
        dtype=int,
    )

    for col in feature_columns:
        if col not in encoded.columns:
            encoded[col] = 0

    encoded = encoded[feature_columns]

    return encoded


def predict_dataframe(df: pd.DataFrame):
    model, scaler, feature_columns = load_artifacts()

    validate_raw_columns(df)

    data_quality_report = build_data_quality_report(df)
    imputed_df = impute_missing_values(df)

    features = build_model_features(imputed_df, feature_columns)
    scaled = scaler.transform(features)

    probabilities = model.predict_proba(scaled)[:, 1] * 100

    results = imputed_df.copy()
    results["churnProbability"] = probabilities.round(2)
    results["riskLevel"] = results["churnProbability"].apply(risk_level)
    results["prediction"] = results["churnProbability"].apply(
        lambda p: "Churn Risk" if p >= 60 else "Safe"
    )

    return {
        "customers": results.fillna("").to_dict(orient="records"),
        "dataQualityReport": data_quality_report,
    }