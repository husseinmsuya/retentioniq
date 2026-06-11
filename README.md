# 🚀 RetentionIQ

**RetentionIQ** is an AI-powered SaaS platform for customer churn prediction and retention analytics. It enables businesses to upload customer data, predict churn risk, analyze revenue impact, and generate AI-driven insights based on real-time predictions.

---

## ✨ Features

* 🔐 Secure user authentication (Clerk)
* 📂 CSV dataset upload & validation
* 🧹 Automated missing value handling
* 🤖 Machine learning-based churn prediction
* 📊 Customer churn risk scoring
* 💰 Revenue-at-risk analytics
* 📈 Interactive dashboard with charts & KPIs
* 🧠 AI-powered insights (Groq)
* 📥 CSV report generation & download
* 🗄️ User-specific data isolation (PostgreSQL)

---

## 📋 Model Input Features

The model expects the following columns:

```txt
CreditScore
Geography
Gender
Age
Tenure
Balance
NumOfProducts
HasCrCard
IsActiveMember
SatisfactionScore
CardType
PointsEarned
EstimatedSalary
```

### Example CSV

```csv
CreditScore,Geography,Gender,Age,Tenure,Balance,NumOfProducts,HasCrCard,IsActiveMember,SatisfactionScore,CardType,PointsEarned,EstimatedSalary
650,France,Male,35,5,50000,2,1,1,4,Gold,1200,85000
720,Germany,Female,42,8,120000,1,1,0,2,Platinum,1800,120000
```

---

## 🛠️ Tech Stack

### Frontend

* ⚡ Next.js
* 📘 TypeScript
* 🎨 Tailwind CSS
* 🔑 Clerk
* ▲ Vercel

### Backend

* 🚀 FastAPI
* 🐍 Python
* 🗄️ PostgreSQL (Neon)
* 🔗 SQLAlchemy
* 🐼 Pandas
* 🤖 Scikit-learn
* 🌲 XGBoost
* 🧠 Groq
* ☁️ Render

---

## ⚙️ How It Works

1. 🔑 User signs in
2. 📂 Uploads a customer dataset
3. ✅ Backend validates and preprocesses data
4. 🤖 ML model predicts churn probability
5. 🗄️ Results are stored in PostgreSQL
6. 📊 Dashboard displays analytics and KPIs
7. 🧠 AI generates business insights
8. 📥 Reports are exported as CSV files

---

## 📁 Project Structure

```bash
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
```

---

## 🔐 Environment Variables

### Frontend

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

### Backend

```env
DATABASE_URL=
GROQ_API_KEY=
CLERK_ISSUER_URL=
MODEL_PATH=app/models/churn_model.pkl
SCALER_PATH=app/models/scaler.sav
```

---

## ▶️ Run Locally

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:** http://localhost:3000
**Backend:** http://localhost:8000

---

## 🔌 API Endpoints

```http
POST /predictions/upload-csv
GET  /predictions/customers
GET  /predictions/summary
POST /ai/insights
GET  /reports/churn
GET  /reports/customers
GET  /reports/revenue
```

---

## 🛡️ Security

* 🔐 Clerk Authentication
* 🎫 Token-based API Protection
* 👤 User Data Isolation
* 🔒 Secure Environment Variables
* 🗄️ PostgreSQL Data Separation
* ✅ Input Validation & Sanitization

---

## 🌐 Live Demo

👉 **https://retentioniq-three.vercel.app**

---

## 👨‍💻 Author

**Hussein Msuya**

Data Scientist & Machine Learning Engineer passionate about building AI-powered solutions that help businesses make smarter decisions and improve customer retention.
