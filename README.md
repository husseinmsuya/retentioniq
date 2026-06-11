# RetentionIQ

Enterprise SaaS shell for AI-powered customer churn intelligence.

## Frontend

```bash
npm install
npm run dev
```

Open http://localhost:3000.

The frontend intentionally ships with no mock customer, churn, revenue, segment, or report data. Dashboards begin at zero and show empty analytics states until the API returns real data.

## Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Environment

Set these before running predictions and AI insights:

```bash
DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/retentioniq
JWT_SECRET=replace-with-secure-secret
MODEL_PATH=models/churn_model.joblib
SCALER_PATH=models/scaler.joblib
GROQ_API_KEY=your-groq-key
```

## Integration Notes

- Put your trained XGBoost, Random Forest, or Logistic Regression model in `MODEL_PATH`.
- Put your scaler/preprocessor in `SCALER_PATH`.
- Update `backend/app/services/model_service.py` with your exact feature order and schema.
- Add PostgreSQL models/migrations for Users, Customers, Predictions, Retention Actions, Reports, Notifications, and Segments.
- Add Groq prompt policy in `backend/app/services/groq_service.py`.
