export const MODEL_FEATURES = [
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
  "EstimatedSalary"
];

export type PredictedCustomer = {
  id: string;
  name?: string;
  CreditScore: number;
  Geography: string;
  Gender: string;
  Age: number;
  Tenure: number;
  Balance: number;
  NumOfProducts: number;
  HasCrCard: number;
  IsActiveMember: number;
  
  SatisfactionScore: number;
  CardType: string;
  PointsEarned: number;
  EstimatedSalary: number;
  churnProbability: number;
  riskLevel: string;
  prediction: string;
};

export function savePredictions(customers: PredictedCustomer[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("retentioniq_predictions", JSON.stringify(customers));
}

export function loadPredictions(): PredictedCustomer[] {
  if (typeof window === "undefined") return [];

  try {
    const saved = localStorage.getItem("retentioniq_predictions");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function riskLevel(probability: number) {
  if (probability >= 80) return "Critical";
  if (probability >= 60) return "High";
  if (probability >= 40) return "Medium";
  return "Low";
}

export function normalizeCustomer(raw: any, index = 0): PredictedCustomer {
  const probability = Number(raw.churnProbability ?? raw.churn_probability ?? raw.probability ?? 0);
  const level = raw.riskLevel ?? raw.risk_level ?? riskLevel(probability);

  return {
    id: String(raw.id ?? raw.CustomerId ?? raw.CustomerID ?? raw.customer_id ?? `CUST-${index + 1}`),
    name: raw.name ?? raw.CustomerName ?? raw.customer_name ?? `Customer ${index + 1}`,
    CreditScore: Number(raw.CreditScore ?? 0),
    Geography: String(raw.Geography ?? "Unknown"),
    Gender: String(raw.Gender ?? raw.Sex ?? "Unknown"),
    Age: Number(raw.Age ?? 0),
    Tenure: Number(raw.Tenure ?? 0),
    Balance: Number(raw.Balance ?? 0),
    NumOfProducts: Number(raw.NumOfProducts ?? 0),
    HasCrCard: Number(raw.HasCrCard ?? 0),
    IsActiveMember: Number(raw.IsActiveMember ?? 0),
   
    SatisfactionScore: Number(raw.SatisfactionScore ?? 0),
    CardType: String(raw.CardType ?? "Unknown"),
    PointsEarned: Number(raw.PointsEarned ?? 0),
    EstimatedSalary: Number(raw.EstimatedSalary ?? 0),
    churnProbability: probability,
    riskLevel: level,
    prediction: probability >= 60 ? "Churn Risk" : "Safe"
  };
}

export function calculateStats(customers: PredictedCustomer[]) {
  const total = customers.length;
  const highRisk = customers.filter((c) => c.churnProbability >= 60).length;
  const critical = customers.filter((c) => c.churnProbability >= 80).length;
  const expectedChurnRate = total ? Math.round((highRisk / total) * 100) : 0;
  const revenueAtRisk = customers
    .filter((c) => c.churnProbability >= 60)
    .reduce((sum, c) => sum + c.EstimatedSalary, 0);
  const avgRisk = total
    ? Math.round(customers.reduce((sum, c) => sum + c.churnProbability, 0) / total)
    : 0;

  return { total, highRisk, critical, expectedChurnRate, revenueAtRisk, avgRisk };
}

export function groupCount(customers: PredictedCustomer[], key: keyof PredictedCustomer) {
  const map = new Map<string, number>();

  customers.forEach((customer) => {
    const value = String(customer[key] || "Unknown");
    map.set(value, (map.get(value) || 0) + 1);
  });

  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

export function groupRiskRevenue(customers: PredictedCustomer[], key: keyof PredictedCustomer) {
  const map = new Map<string, number>();

  customers
    .filter((customer) => customer.churnProbability >= 60)
    .forEach((customer) => {
      const value = String(customer[key] || "Unknown");
      map.set(value, (map.get(value) || 0) + customer.EstimatedSalary);
    });

  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

export function probabilityBands(customers: PredictedCustomer[]) {
  const bands = [
    { name: "0-20%", value: 0 },
    { name: "21-40%", value: 0 },
    { name: "41-60%", value: 0 },
    { name: "61-80%", value: 0 },
    { name: "81-100%", value: 0 }
  ];

  customers.forEach((customer) => {
    const p = customer.churnProbability;
    if (p <= 20) bands[0].value += 1;
    else if (p <= 40) bands[1].value += 1;
    else if (p <= 60) bands[2].value += 1;
    else if (p <= 80) bands[3].value += 1;
    else bands[4].value += 1;
  });

  return bands;
}

export function riskDistribution(customers: PredictedCustomer[]) {
  return ["Low", "Medium", "High", "Critical"].map((level) => ({
    name: level,
    value: customers.filter((customer) => customer.riskLevel === level).length
  }));
}

export function generateInsights(customers: PredictedCustomer[]) {
  if (!customers.length) {
    return ["Upload customer data to generate churn insights."];
  }

  const highRisk = customers.filter((c) => c.churnProbability >= 60);
  const lowSatisfaction = customers.filter((c) => c.SatisfactionScore <= 2);
  

  const geoRisk = groupCount(highRisk, "Geography").sort((a, b) => b.value - a.value)[0];
  const cardRisk = groupCount(highRisk, "CardType").sort((a, b) => b.value - a.value)[0];

  return [
    `High-risk customers represent ${Math.round((highRisk.length / customers.length) * 100)}% of the uploaded dataset.`,
    `${lowSatisfaction.length} customers have low satisfaction scores and should be prioritized for retention.`,
    
    geoRisk ? `${geoRisk.name} contributes the largest share of high-risk customers.` : "No geography risk pattern detected yet.",
    cardRisk ? `${cardRisk.name} card holders require focused retention monitoring.` : "No card type pattern detected yet."
  ];
}

export function recommendationsFor(customer: PredictedCustomer) {
  const actions: string[] = [];

  
  if (customer.SatisfactionScore <= 2) actions.push("Offer loyalty reward");
  if (customer.IsActiveMember === 0) actions.push("Launch reactivation campaign");
  if (customer.churnProbability >= 80) actions.push("Assign relationship manager");
  if (customer.PointsEarned < 500) actions.push("Boost rewards engagement");

  return actions.length ? actions : ["Continue standard engagement"];
}