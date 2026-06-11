 RetentionIQ

RetentionIQ is an AI-powered SaaS platform for customer churn prediction and retention analytics. It enables businesses to upload customer data, predict churn risk, analyze revenue impact, and generate AI-driven insights based on real-time predictions.

Features
Secure user authentication (Clerk)
CSV dataset upload & validation
Automated missing value handling
Machine learning-based churn prediction
Customer churn risk scoring
Revenue-at-risk analytics
Interactive dashboard with charts & KPIs
AI-powered insights (Groq)
CSV report generation & download
User-specific data isolation (PostgreSQL)
Model Input Features

CreditScore, Geography, Gender, Age, Tenure, Balance, NumOfProducts, HasCrCard, IsActiveMember, SatisfactionScore, CardType, PointsEarned, EstimatedSalary

Example CSV:

CreditScore,Geography,Gender,Age,Tenure,Balance,NumOfProducts,HasCrCard,IsActiveMember,SatisfactionScore,CardType,PointsEarned,EstimatedSalary
650,France,Male,35,5,50000,2,1,1,4,Gold,1200,85000
720,Germany,Female,42,8,120000,1,1,0,2,Platinum,1800,120000
Tech Stack

Frontend: Next.js, TypeScript, Tailwind CSS, Clerk, Vercel
Backend: FastAPI, Python, PostgreSQL (Neon), SQLAlchemy, Pandas, Scikit-learn, XGBoost, Groq, Render

How It Works

User signs in → uploads CSV → backend validates & preprocesses data → ML model predicts churn → results stored in PostgreSQL → dashboard displays analytics → AI generates insights → reports exported as CSV

Project Structure
AI_CHURN/
├── app/
│   ├── dashboard/
│   ├── upload/
│   ├── customers/
│   ├── insights/
│   ├── reports/
│   ├── settings/
│   ├── sign-in/
│   └── sign-up/
├── components/
├── public/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── services/
│   │   ├── auth.py
│   │   ├── database.py
│   │   └── main.py
│   └── requirements.txt
└── README.md
Environment Variables

Frontend:

NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

Backend:

DATABASE_URL=
GROQ_API_KEY=
CLERK_ISSUER_URL=
MODEL_PATH=app/models/churn_model.pkl
SCALER_PATH=app/models/scaler.sav
Run Locally

Frontend:

npm install
npm run dev

Backend:

cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

Frontend runs at: http://localhost:3000
Backend runs at: http://localhost:8000

API Endpoints

POST /predictions/upload-csv
GET /predictions/customers
GET /predictions/summary
POST /ai/insights
GET /reports/churn
GET /reports/customers
GET /reports/revenue

Security

Clerk authentication, token-based API protection, user data isolation, secure environment variables, PostgreSQL separation, input validation.

Author
Built by Hussein Msuya

You can check it out on 
Live Demo----https://retentioniq-three.vercel.app



