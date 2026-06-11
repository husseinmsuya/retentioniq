export const modules = [
  "Dashboard",
  "Customers",
  "Predictions",
  "Explainable AI",
  "Retention",
  "Segments",
  "Revenue",
  "Forecasting",
  "Insights",
  "Reports",
  "Notifications",
  "Admin"
];

export const emptyKpis = [
  { label: "Total Customers", value: "0", delta: "Connect data", icon: "Users" },
  { label: "Active Customers", value: "0", delta: "Awaiting import", icon: "CheckCircle2" },
  { label: "Churn Risk Customers", value: "0", delta: "Run model", icon: "AlertTriangle" },
  { label: "Retention Rate", value: "--", delta: "Needs predictions", icon: "Target" },
  { label: "Churn Rate", value: "--", delta: "Needs predictions", icon: "Activity" },
  { label: "Monthly Revenue", value: "$0", delta: "Connect billing", icon: "BadgeDollarSign" }
];

export const setupSteps = [
  "Connect PostgreSQL tenant database",
  "Upload trained churn model file",
  "Upload feature scaler/preprocessor",
  "Configure Groq API key for AI insights",
  "Map customer, billing, usage, and support columns",
  "Run first prediction job"
];

export const apiContracts = [
  { method: "POST", path: "/auth/sign-in", description: "JWT login with role claims" },
  { method: "POST", path: "/auth/sign-up", description: "Create tenant user and send verification email" },
  { method: "POST", path: "/predictions/run", description: "Run model plus scaler against customer features" },
  { method: "GET", path: "/analytics/dashboard", description: "Return KPI, chart, and segment aggregates" },
  { method: "POST", path: "/ai/insights", description: "Generate executive insights through Groq" },
  { method: "POST", path: "/reports/export", description: "Generate PDF, Excel, or CSV reports" }
];

export const modelSlots = [
  { name: "XGBoost", status: "Not uploaded", metric: "ROC-AUC", value: "--" },
  { name: "Random Forest", status: "Not uploaded", metric: "F1 Score", value: "--" },
  { name: "Logistic Regression", status: "Not uploaded", metric: "Accuracy", value: "--" }
];
