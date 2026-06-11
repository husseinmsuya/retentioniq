"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { UserButton, useAuth, useUser } from "@clerk/nextjs";
import {
  Activity,
  AlertTriangle,
  BadgeDollarSign,
  BarChart3,
  Bell,
  BrainCircuit,
  CheckCircle2,
  Database,
  Download,
  FileText,
  Home,
  Loader2,
  MessageSquareText,
  Search,
  Send,
  Settings,
  Target,
  Upload,
  Users,
  WandSparkles
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  PredictedCustomer,
  calculateStats,
  generateInsights,
  groupCount,
  groupRiskRevenue,
  probabilityBands,
  riskDistribution
} from "@/lib/retention-data";

type Role = "Admin" | "Manager" | "User";

type Analytics = {
  riskPie: { name: string; value: number }[];
  geography: { name: string; value: number }[];
  cardType: { name: string; value: number }[];
  gender: { name: string; value: number }[];
  revenueByGeography: { name: string; value: number }[];
  probability: { name: string; value: number }[];
  topRisk: PredictedCustomer[];
  retentionTrend: { name: string; retention: number; churn: number }[];
};

const API_BASE = "http://localhost:8000";

const sidebar = [
  { label: "Landing Page", href: "/", page: "landing", icon: Home },
  { label: "Dashboard", href: "/dashboard", page: "dashboard", icon: Home },
  { label: "Upload Data", href: "/upload", page: "upload", icon: Upload },
  { label: "Customers", href: "/customers", page: "customers", icon: Users },
  { label: "Predictions", href: "/predictions", page: "predictions", icon: BrainCircuit },
  { label: "Segments", href: "/segments", page: "segments", icon: BarChart3 },
  { label: "Revenue", href: "/revenue", page: "revenue", icon: BadgeDollarSign },
  { label: "AI Insights", href: "/insights", page: "insights", icon: MessageSquareText },
  { label: "Recommendations", href: "/recommendations", page: "recommendations", icon: WandSparkles },
  { label: "Reports", href: "/reports", page: "reports", icon: FileText },
  { label: "Alerts", href: "/alerts", page: "alerts", icon: Bell },
  { label: "Settings", href: "/settings", page: "settings", icon: Settings }
];

const pageMeta: Record<string, { eyebrow: string; title: string; body: string }> = {
  dashboard: {
    eyebrow: "Dashboard",
    title: "Customer churn analytics center",
    body: "Monitor churn risk, expected churn rate, revenue exposure, geography patterns, and customer risk distribution."
  },
  customers: {
    eyebrow: "Customer Intelligence",
    title: "Predicted customer records",
    body: "Review every predicted customer, risk level, churn probability, salary exposure, card type, and region."
  },
  predictions: {
    eyebrow: "Predictions",
    title: "AI churn prediction analysis",
    body: "Analyze churn probability bands, critical-risk accounts, and prediction output from uploaded customer data."
  },
  segments: {
    eyebrow: "Segments",
    title: "Customer segment analytics",
    body: "Understand risk distribution by geography, gender, card type, age profile, and customer attributes."
  },
  revenue: {
    eyebrow: "Revenue",
    title: "Revenue impact intelligence",
    body: "Analyze estimated revenue at risk based on high-risk customers and salary exposure."
  },
  insights: {
    eyebrow: "AI Insights",
    title: "Ask AI about churn drivers",
    body: "Ask questions about churn, risky geographies, low satisfaction, inactive customers, and retention actions."
  },
  recommendations: {
    eyebrow: "Recommendations",
    title: "Retention action center",
    body: "Prioritize retention actions based on churn risk, satisfaction score, and engagement."
  },
  reports: {
    eyebrow: "Reports",
    title: "Reports center",
    body: "Generate churn, customer, revenue, retention, and executive reports."
  },
  alerts: {
    eyebrow: "Alerts",
    title: "Risk notifications",
    body: "Track critical and high-risk customer alerts from the latest prediction batch."
  },
  settings: {
    eyebrow: "Settings",
    title: "Workspace settings",
    body: "Manage profile, security, appearance, system information, and uploaded prediction data."
  }
};

function riskColor(risk: string) {
  if (risk === "Critical") return "#ef4444";
  if (risk === "High") return "#f97316";
  if (risk === "Medium") return "#eab308";
  return "#22c55e";
}

function formatTZS(value: number) {
  return `TZS ${Math.round(Number(value || 0)).toLocaleString()}`;
}

async function authHeaders(getToken: () => Promise<string | null>) {
  const token = await getToken();

  if (!token) {
    throw new Error("Authentication token missing. Please sign in again.");
  }

  return {
    Authorization: `Bearer ${token}`
  };
}

async function downloadAuthedReport(
  endpoint: string,
  filename: string,
  getToken: () => Promise<string | null>
) {
  const headers = await authHeaders(getToken);

  const res = await fetch(endpoint, { headers });

  if (!res.ok) {
    throw new Error("Report download failed.");
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

function normalizeApiCustomer(customer: any, index: number): PredictedCustomer {
  return {
    id: String(customer.id ?? index + 1),
    name: customer.name ?? `Customer ${customer.id ?? index + 1}`,
    CreditScore: Number(customer.CreditScore ?? 0),
    Geography: String(customer.Geography ?? "Unknown"),
    Gender: String(customer.Gender ?? "Unknown"),
    Age: Number(customer.Age ?? 0),
    Tenure: Number(customer.Tenure ?? 0),
    Balance: Number(customer.Balance ?? 0),
    NumOfProducts: Number(customer.NumOfProducts ?? 0),
    HasCrCard: Number(customer.HasCrCard ?? 0),
    IsActiveMember: Number(customer.IsActiveMember ?? 0),
    SatisfactionScore: Number(customer.SatisfactionScore ?? 0),
    CardType: String(customer.CardType ?? "Unknown"),
    PointsEarned: Number(customer.PointsEarned ?? 0),
    EstimatedSalary: Number(customer.EstimatedSalary ?? 0),
    churnProbability: Number(customer.churnProbability ?? 0),
    riskLevel: String(customer.riskLevel ?? "Low"),
    prediction: String(customer.prediction ?? "Safe")
  };
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="grid h-64 place-items-center rounded-xl border border-dashed border-white/10 bg-black/30 text-center">
      <div>
        <Database className="mx-auto h-10 w-10 text-slate-600" />
        <p className="mt-3 font-bold text-slate-300">{label}</p>
        <p className="mt-1 text-sm text-slate-500">Go to Upload Data and process a CSV dataset.</p>
        <Link href="/upload" className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold hover:bg-blue-500">
          Upload Data
        </Link>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.06] p-6">
      <h3 className="mb-5 text-lg font-black">{title}</h3>
      {children}
    </div>
  );
}

function CustomerTable({ customers }: { customers: PredictedCustomer[] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.06] p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-black">Customer Intelligence</h3>
        <span className="text-sm text-slate-400">{customers.length} records</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {["ID", "Customer", "Geography", "Gender", "Age", "Card Type", "Salary", "Risk Score", "Risk", "Action"].map((h) => (
                <th key={h} className="border-b border-white/10 px-3 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-3 py-16 text-center text-slate-500">
                  No predicted customers yet. Upload a dataset first.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="border-b border-white/5">
                  <td className="px-3 py-3">{c.id}</td>
                  <td className="px-3 py-3 font-semibold">{c.name}</td>
                  <td className="px-3 py-3">{c.Geography}</td>
                  <td className="px-3 py-3">{c.Gender}</td>
                  <td className="px-3 py-3">{c.Age}</td>
                  <td className="px-3 py-3">{c.CardType}</td>
                  <td className="px-3 py-3">{formatTZS(c.EstimatedSalary)}</td>
                  <td className="px-3 py-3">{c.churnProbability}%</td>
                  <td className="px-3 py-3">
                    <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-bold">{c.riskLevel}</span>
                  </td>
                  <td className="px-3 py-3">
                    <Link href={`/customers/${c.id}`} className="text-blue-300 hover:text-blue-200">
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TopRiskCustomers({ customers }: { customers: PredictedCustomer[] }) {
  return (
    <ChartCard title="Top Risk Customers">
      {customers.length ? (
        <div className="space-y-3">
          {customers.map((customer) => (
            <Link
              key={customer.id}
              href={`/customers/${customer.id}`}
              className="flex items-center justify-between rounded-lg bg-black/30 p-4 hover:bg-white/10"
            >
              <div>
                <p className="font-bold">{customer.name}</p>
                <p className="text-sm text-slate-500">{customer.Geography} - {customer.CardType}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-red-400">{customer.churnProbability}%</p>
                <p className="text-xs text-slate-500">{customer.riskLevel}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState label="No top risk customers yet" />
      )}
    </ChartCard>
  );
}

function DashboardCharts({ customers, analytics }: { customers: PredictedCustomer[]; analytics: Analytics }) {
  return (
    <section className="mt-6 grid gap-6 xl:grid-cols-2">
      <ChartCard title="Churn Risk Distribution">
        {customers.length ? (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={analytics.riskPie} dataKey="value" nameKey="name" innerRadius={70} outerRadius={105}>
                {analytics.riskPie.map((entry) => <Cell key={entry.name} fill={riskColor(entry.name)} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : <EmptyState label="No risk distribution yet" />}
      </ChartCard>

      <ChartCard title="Churn Probability Distribution">
        {customers.length ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={analytics.probability}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <EmptyState label="No probability analytics yet" />}
      </ChartCard>

      <ChartCard title="Geography Analysis">
        {customers.length ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={analytics.geography}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <EmptyState label="No geography analytics yet" />}
      </ChartCard>

      <ChartCard title="Card Type Analysis">
        {customers.length ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={analytics.cardType}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <EmptyState label="No card type analytics yet" />}
      </ChartCard>

      <ChartCard title="Retention vs Churn">
        {customers.length ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={analytics.retentionTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Area type="monotone" dataKey="retention" stroke="#22c55e" fill="#22c55e" fillOpacity={0.25} />
              <Area type="monotone" dataKey="churn" stroke="#ef4444" fill="#ef4444" fillOpacity={0.25} />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        ) : <EmptyState label="No retention analytics yet" />}
      </ChartCard>

      <TopRiskCustomers customers={analytics.topRisk} />
    </section>
  );
}

function InsightsModule({ customers }: { customers: PredictedCustomer[] }) {
  const { getToken } = useAuth();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function askAI(input?: string) {
    const prompt = input || question;
    if (!prompt.trim()) return;

    if (!customers.length) {
      setQuestion(prompt);
      setAnswer("No uploaded prediction data found. Please upload a CSV dataset first, then ask again.");
      return;
    }

    setQuestion(prompt);
    setLoading(true);
    setAnswer("");

    try {
      const headers = await authHeaders(getToken);

      const res = await fetch(`${API_BASE}/ai/insights`, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ question: prompt })
      });

      const data = await res.json();
      setAnswer(data.answer || data.message || "AI service returned no answer.");
    } catch (error) {
      setAnswer(error instanceof Error ? error.message : generateInsights(customers).join("\n"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <div className="rounded-xl border border-white/10 bg-white/[0.06] p-6">
        <h3 className="text-lg font-black">Generated Insights</h3>
        <div className="mt-5 space-y-3">
          {generateInsights(customers).map((insight) => (
            <div key={insight} className="rounded-lg bg-black/30 p-4 text-sm leading-6 text-slate-300">
              {insight}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.06] p-6">
        <h3 className="text-lg font-black">Ask AI</h3>
        <p className="mt-1 text-sm text-slate-400">AI will answer using your own uploaded prediction data from Neon.</p>

        <div className="mt-5 flex gap-3">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") askAI();
            }}
            placeholder="Ask about revenue at risk, churn, geography, satisfaction..."
            className="h-12 min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400"
          />
          <button
            onClick={() => askAI()}
            disabled={loading}
            className="inline-flex h-12 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-bold hover:bg-blue-500 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Ask
          </button>
        </div>

        <div className="mt-6 min-h-[260px] rounded-xl border border-white/10 bg-black/30 p-5">
          {loading ? (
            <div className="flex h-52 items-center justify-center text-slate-400">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Thinking from your prediction data...
            </div>
          ) : answer ? (
            <p className="whitespace-pre-line leading-7 text-slate-200">{answer}</p>
          ) : (
            <EmptyState label="Ask AI or upload data to generate insights" />
          )}
        </div>
      </div>
    </section>
  );
}

function SettingsModule() {
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState("Profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [status, setStatus] = useState("");

  const [profile, setProfile] = useState({
    fullName: "RetentionIQ Admin",
    email: "admin@retentioniq.ai",
    profilePictureUrl: ""
  });

  const [theme, setTheme] = useState("Dark Mode");

  const [system, setSystem] = useState({
    productVersion: "RetentionIQ v1.0",
    model: "XGBoost",
    totalUploads: 0,
    totalPredictions: 0
  });

  const [security, setSecurity] = useState({
    lastLogin: "Current session"
  });

  const tabs = ["Profile", "Security", "Appearance", "System", "Data"];

  const profileImageSrc =
    profile.profilePictureUrl && profile.profilePictureUrl.startsWith("/uploads")
      ? `${API_BASE}${profile.profilePictureUrl}`
      : profile.profilePictureUrl;

  useEffect(() => {
    async function loadSettings() {
      try {
        const headers = await authHeaders(getToken);

        const res = await fetch(`${API_BASE}/settings`, {
          cache: "no-store",
          headers
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.detail || "Settings request failed.");
        }

        if (data.profile) {
          setProfile({
            fullName: data.profile.fullName || "RetentionIQ Admin",
            email: data.profile.email || "admin@retentioniq.ai",
            profilePictureUrl: data.profile.profilePictureUrl || ""
          });
        }

        if (data.appearance?.theme) setTheme(data.appearance.theme);
        if (data.security) setSecurity({ lastLogin: data.security.lastLogin || "Current session" });

        if (data.system) {
          setSystem({
            productVersion: data.system.productVersion || "RetentionIQ v1.0",
            model: data.system.model || "XGBoost",
            totalUploads: Number(data.system.totalUploads || 0),
            totalPredictions: Number(data.system.totalPredictions || 0)
          });
        }
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Settings backend is not reachable.");
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [getToken]);

  async function saveJson(endpoint: string, payload: any, label: string) {
    setSaving(label);
    setStatus("");

    try {
      const headers = await authHeaders(getToken);

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "PUT",
        headers: {
          ...headers,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Save failed.");

      if (data.settings?.profile) {
        setProfile({
          fullName: data.settings.profile.fullName || "RetentionIQ Admin",
          email: data.settings.profile.email || "admin@retentioniq.ai",
          profilePictureUrl: data.settings.profile.profilePictureUrl || ""
        });
      }

      if (data.settings?.appearance?.theme) setTheme(data.settings.appearance.theme);

      if (data.settings?.system) {
        setSystem({
          productVersion: data.settings.system.productVersion || "RetentionIQ v1.0",
          model: data.settings.system.model || "XGBoost",
          totalUploads: Number(data.settings.system.totalUploads || 0),
          totalPredictions: Number(data.settings.system.totalPredictions || 0)
        });
      }

      setStatus(data.message || "Saved successfully.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setSaving("");
    }
  }

  async function uploadProfilePicture(file: File) {
    setSaving("profile-picture");
    setStatus("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const headers = await authHeaders(getToken);

      const res = await fetch(`${API_BASE}/settings/profile-picture`, {
        method: "POST",
        headers,
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Profile picture upload failed.");

      if (data.settings?.profile) {
        setProfile({
          fullName: data.settings.profile.fullName || profile.fullName,
          email: data.settings.profile.email || profile.email,
          profilePictureUrl: data.settings.profile.profilePictureUrl || ""
        });
      } else if (data.profilePictureUrl) {
        setProfile((current) => ({ ...current, profilePictureUrl: data.profilePictureUrl }));
      }

      setStatus(data.message || "Profile picture uploaded successfully.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Profile picture upload failed.");
    } finally {
      setSaving("");
    }
  }

  function saveProfile() {
    saveJson(
      "/settings/profile",
      {
        full_name: profile.fullName,
        email: profile.email,
        profile_picture_url: profile.profilePictureUrl
      },
      "profile"
    );
  }

  function saveAppearance(nextTheme: string) {
    setTheme(nextTheme);
    saveJson("/settings/appearance", { theme: nextTheme }, "appearance");
  }

  async function deleteUploadedData() {
    const confirmed = window.confirm("Are you sure you want to delete all uploaded prediction data from Neon?");
    if (!confirmed) return;

    setSaving("delete-data");
    setStatus("");

    try {
      const headers = await authHeaders(getToken);

      const res = await fetch(`${API_BASE}/settings/prediction-history`, {
        method: "DELETE",
        headers
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Failed to delete uploaded data.");

      setSystem((current) => ({ ...current, totalPredictions: 0 }));
      setStatus(`${data.message}. Deleted records: ${data.deletedRecords}`);

      setTimeout(() => window.location.reload(), 900);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to delete uploaded data.");
    } finally {
      setSaving("");
    }
  }

  if (loading) {
    return (
      <section className="mt-6 rounded-xl border border-white/10 bg-white/[0.06] p-6">
        <div className="flex items-center gap-3 text-slate-300">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading settings...
        </div>
      </section>
    );
  }

  return (
    <section className="mt-6">
      <div className="rounded-xl border border-white/10 bg-white/[0.06] p-2">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                activeTab === tab ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {status && (
        <div className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-blue-100">
          {status}
        </div>
      )}

      {activeTab === "Profile" && (
        <div className="mt-6 grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
          <div className="rounded-xl border border-white/10 bg-white/[0.06] p-6">
            <h3 className="text-xl font-black">Profile Photo</h3>

            <div className="mt-6 grid h-36 w-36 place-items-center overflow-hidden rounded-full border border-white/10 bg-blue-500/15 text-4xl font-black text-blue-300">
              {profileImageSrc ? (
                <img src={profileImageSrc} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                "RI"
              )}
            </div>

            <label className="mt-5 inline-flex cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-500">
              {saving === "profile-picture" ? "Uploading..." : "Upload Photo"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                disabled={saving === "profile-picture"}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) uploadProfilePicture(file);
                }}
              />
            </label>

            <p className="mt-3 text-xs leading-5 text-slate-500">PNG, JPG, JPEG, or WEBP. Max size 5MB.</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.06] p-6">
            <h3 className="text-xl font-black">Profile</h3>
            <p className="mt-2 text-sm text-slate-400">
              This is the admin account profile, not customer dataset information.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold text-slate-400">Name</span>
                <input
                  value={profile.fullName}
                  onChange={(event) => setProfile((current) => ({ ...current, fullName: event.target.value }))}
                  className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-blue-400"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-400">Email</span>
                <input
                  value={profile.email}
                  onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))}
                  className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-blue-400"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={saveProfile}
              disabled={saving === "profile"}
              className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold hover:bg-blue-500 disabled:opacity-60"
            >
              {saving === "profile" ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>
      )}

      {activeTab === "Security" && (
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.06] p-6">
            <h3 className="text-xl font-black">Change Password</h3>
            <p className="mt-2 text-sm text-slate-400">Password and account security are handled by Clerk.</p>

            <Link href="/user-profile" className="mt-6 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold hover:bg-blue-500">
              Open Account Settings
            </Link>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.06] p-6">
            <h3 className="text-xl font-black">Last Login</h3>
            <p className="mt-4 text-3xl font-black">{security.lastLogin}</p>
            <p className="mt-2 text-sm text-slate-400">This represents the current active admin session.</p>
          </div>
        </div>
      )}

      {activeTab === "Appearance" && (
        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.06] p-6">
          <h3 className="text-xl font-black">Appearance</h3>
          <p className="mt-2 text-sm text-slate-400">Choose how the dashboard should appear in the workspace.</p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {["Dark Mode", "Light Mode", "System"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => saveAppearance(option)}
                className={`rounded-xl border p-5 text-left transition ${
                  theme === option ? "border-blue-400 bg-blue-500/15" : "border-white/10 bg-black/30 hover:bg-white/5"
                }`}
              >
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-300">{option}</p>
                <p className="mt-3 font-black">{option}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === "System" && (
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Version", system.productVersion],
            ["Model", system.model],
            ["Total Uploads", system.totalUploads.toLocaleString()],
            ["Total Predictions", system.totalPredictions.toLocaleString()]
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-white/10 bg-white/[0.06] p-6">
              <p className="text-sm font-bold uppercase tracking-wide text-slate-500">{label}</p>
              <p className="mt-4 break-words text-3xl font-black leading-tight">{value}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "Data" && (
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.06] p-6">
            <h3 className="text-xl font-black">Download Uploaded Data</h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">Export the latest customer prediction dataset from Neon.</p>

            <button
              type="button"
              onClick={() =>
                downloadAuthedReport(
                  `${API_BASE}/reports/customers`,
                  "retentioniq_customer_prediction_report.csv",
                  getToken
                ).catch((error) => setStatus(error instanceof Error ? error.message : "Report download failed."))
              }
              className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold hover:bg-blue-500"
            >
              Download CSV
            </button>
          </div>

          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6">
            <h3 className="text-xl font-black text-red-100">Delete Uploaded Data</h3>
            <p className="mt-3 text-sm leading-6 text-red-100/80">
              This deletes uploaded customer prediction records from Neon. It does not delete Clerk accounts or authentication data.
            </p>

            <button
              type="button"
              onClick={deleteUploadedData}
              disabled={saving === "delete-data"}
              className="mt-6 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold hover:bg-red-500 disabled:opacity-60"
            >
              {saving === "delete-data" ? "Deleting..." : "Delete Data"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function ModuleContent({
  page,
  customers,
  analytics,
  stats
}: {
  page: string;
  customers: PredictedCustomer[];
  analytics: Analytics;
  stats: ReturnType<typeof calculateStats>;
}) {
  const { getToken } = useAuth();

  if (page === "dashboard") return <DashboardCharts customers={customers} analytics={analytics} />;

  if (page === "customers") {
    return (
      <section className="mt-6">
        <CustomerTable customers={customers} />
      </section>
    );
  }

  if (page === "predictions") {
    return (
      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <ChartCard title="Churn Probability Distribution">
          {customers.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.probability}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState label="No prediction data yet" />}
        </ChartCard>
        <TopRiskCustomers customers={analytics.topRisk} />
      </section>
    );
  }

  if (page === "segments") {
    return (
      <section className="mt-6 grid gap-6 xl:grid-cols-3">
        <ChartCard title="Geography Analysis">
          {customers.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.geography}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState label="No geography analytics yet" />}
        </ChartCard>

        <ChartCard title="Gender Analysis">
          {customers.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={analytics.gender} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100}>
                  {analytics.gender.map((entry, i) => (
                    <Cell key={entry.name} fill={["#3b82f6", "#ec4899", "#8b5cf6"][i % 3]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyState label="No gender analytics yet" />}
        </ChartCard>

        <ChartCard title="Card Type Analysis">
          {customers.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.cardType}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState label="No card type analytics yet" />}
        </ChartCard>
      </section>
    );
  }

  if (page === "revenue") {
    const totalSalary = customers.reduce((sum, c) => sum + c.EstimatedSalary, 0);

    return (
      <section className="mt-6 grid gap-6 xl:grid-cols-3">
        {[
          ["Total Estimated Salary", formatTZS(totalSalary)],
          ["Revenue at Risk", formatTZS(stats.revenueAtRisk)],
          ["Protected Revenue", formatTZS(totalSalary - stats.revenueAtRisk)]
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-white/10 bg-white/[0.06] p-6">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-3 break-words text-3xl font-black leading-tight">{value}</p>
          </div>
        ))}

        <div className="xl:col-span-3">
          <ChartCard title="Revenue at Risk by Geography">
            {customers.length ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={analytics.revenueByGeography}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyState label="No revenue analytics yet" />}
          </ChartCard>
        </div>
      </section>
    );
  }

  if (page === "insights") return <InsightsModule customers={customers} />;

  if (page === "recommendations") {
    const highRisk = customers.filter((c) => c.churnProbability >= 60);
    const lowSatisfaction = customers.filter((c) => c.SatisfactionScore <= 2);
    const inactive = customers.filter((c) => c.IsActiveMember === 0);

    return (
      <section className="mt-6 grid gap-6 xl:grid-cols-3">
        {[
          ["Assign Relationship Manager", `${highRisk.length} high-risk customers`, "Prioritize customers above 60% churn risk."],
          ["Offer Loyalty Reward", `${lowSatisfaction.length} low satisfaction customers`, "Target customers with weak satisfaction scores."],
          ["Launch Reactivation Campaign", `${inactive.length} inactive customers`, "Recover inactive customers before they churn."]
        ].map(([title, count, body]) => (
          <div key={title} className="rounded-xl border border-white/10 bg-white/[0.06] p-6">
            <h3 className="text-xl font-black">{title}</h3>
            <p className="mt-3 text-blue-300">{count}</p>
            <p className="mt-3 text-sm leading-6 text-slate-400">{body}</p>
          </div>
        ))}
      </section>
    );
  }

  if (page === "reports") {
    return (
      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          ["Churn Report", `${API_BASE}/reports/churn`, "retentioniq_churn_risk_report.csv"],
          ["Customer Report", `${API_BASE}/reports/customers`, "retentioniq_customer_prediction_report.csv"],
          ["Revenue Report", `${API_BASE}/reports/revenue`, "retentioniq_revenue_at_risk_report.csv"]
        ].map(([report, endpoint, filename]) => (
          <div key={report} className="rounded-xl border border-white/10 bg-white/[0.06] p-6">
            <FileText className="h-7 w-7 text-blue-300" />
            <h3 className="mt-5 text-xl font-black">{report}</h3>
            <p className="mt-2 text-sm text-slate-400">Generate CSV export from your own Neon prediction data.</p>
            <button
              onClick={() => downloadAuthedReport(endpoint, filename, getToken)}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold hover:bg-blue-500"
            >
              <Download className="h-4 w-4" />
              Generate
            </button>
          </div>
        ))}
      </section>
    );
  }

  if (page === "alerts") {
    const alerts = customers.filter((c) => c.churnProbability >= 60);

    return (
      <section className="mt-6 space-y-3">
        {alerts.length ? (
          alerts.map((customer) => (
            <Link
              key={customer.id}
              href={`/customers/${customer.id}`}
              className="block rounded-xl border border-red-500/20 bg-red-500/10 p-5 hover:bg-red-500/15"
            >
              <p className="font-black">{customer.riskLevel} Risk Customer</p>
              <p className="mt-1 text-sm text-slate-300">
                {customer.name} has {customer.churnProbability}% churn probability.
              </p>
            </Link>
          ))
        ) : <EmptyState label="No high-risk alerts yet" />}
      </section>
    );
  }

  if (page === "settings") return <SettingsModule />;

  return <EmptyState label="Module content coming soon" />;
}

export function RetentionDashboard({ page = "dashboard" }: { page?: string }) {
  const { getToken } = useAuth();
  const { user } = useUser();
  const role = ((user?.publicMetadata?.role as Role) || "User") as Role;
  const meta = pageMeta[page] || pageMeta.dashboard;

  const [customers, setCustomers] = useState<PredictedCustomer[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadCustomersFromNeon() {
      setLoadingData(true);

      try {
        const headers = await authHeaders(getToken);

        const res = await fetch(`${API_BASE}/predictions/customers`, {
          cache: "no-store",
          headers
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.detail || "Failed to load customers.");
        }

        if (!active) return;

        const nextCustomers = Array.isArray(data.customers)
          ? data.customers.map((customer: any, index: number) => normalizeApiCustomer(customer, index))
          : [];

        setCustomers(nextCustomers);
      } catch {
        if (active) setCustomers([]);
      } finally {
        if (active) setLoadingData(false);
      }
    }

    loadCustomersFromNeon();

    return () => {
      active = false;
    };
  }, [getToken]);

  const stats = useMemo(() => calculateStats(customers), [customers]);

  const analytics = useMemo<Analytics>(() => {
    const riskPie = riskDistribution(customers);
    const geography = groupCount(customers, "Geography");
    const cardType = groupCount(customers, "CardType");
    const gender = groupCount(customers, "Gender");
    const revenueByGeography = groupRiskRevenue(customers, "Geography");
    const probability = probabilityBands(customers);
    const topRisk = [...customers].sort((a, b) => b.churnProbability - a.churnProbability).slice(0, 5);
    const totalSalary = customers.reduce((sum, c) => sum + c.EstimatedSalary, 0);

    const retentionTrend = [
      { name: "Customers", retention: 100 - stats.expectedChurnRate, churn: stats.expectedChurnRate },
      {
        name: "Revenue",
        retention: customers.length
          ? Math.max(0, 100 - Math.round((stats.revenueAtRisk / Math.max(1, totalSalary)) * 100))
          : 0,
        churn: customers.length ? Math.round((stats.revenueAtRisk / Math.max(1, totalSalary)) * 100) : 0
      }
    ];

    return { riskPie, geography, cardType, gender, revenueByGeography, probability, topRisk, retentionTrend };
  }, [customers, stats]);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-white/10 bg-slate-950 p-5 lg:block">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-black">RetentionIQ</h1>
              <p className="text-xs text-slate-500">{role} Workspace</p>
            </div>
          </div>

          <nav className="mt-8 space-y-1">
            {sidebar.map((item) => {
              const Icon = item.icon;
              const active = item.page === page;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${
                    active ? "bg-blue-500/15 text-blue-200" : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur-xl">
            <div className="flex h-16 items-center justify-between px-5 lg:px-8">
              <div>
                <p className="text-sm text-slate-500">Signed in as {role}</p>
                <h2 className="font-black">{user?.firstName ?? "RetentionIQ"} Workspace</h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden h-10 w-80 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-slate-500 md:flex">
                  <Search className="h-4 w-4" />
                  Search customers...
                </div>
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </header>

          <div className="px-5 py-8 lg:px-8">
            <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-400">{meta.eyebrow}</p>
                <h2 className="mt-2 text-4xl font-black">{meta.title}</h2>
                <p className="mt-2 max-w-3xl text-slate-400">{meta.body}</p>
              </div>

              <Link
                href="/upload"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-bold text-white hover:from-blue-500 hover:to-indigo-500"
              >
                <Upload className="h-4 w-4" />
                Upload Data
              </Link>
            </div>

            {loadingData && (
              <div className="mb-6 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-blue-100">
                Loading latest prediction data from Neon...
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
              {[
                { label: "Total Customers", value: stats.total, icon: Users },
                { label: "High Risk", value: stats.highRisk, icon: AlertTriangle },
                { label: "Critical Risk", value: stats.critical, icon: Target },
                { label: "Expected Churn", value: `${stats.expectedChurnRate}%`, icon: Activity },
                { label: "Avg Risk Score", value: `${stats.avgRisk}%`, icon: CheckCircle2 },
                { label: "Revenue at Risk", value: formatTZS(stats.revenueAtRisk), icon: BadgeDollarSign }
              ].map((kpi) => {
                const Icon = kpi.icon;

                return (
                  <div key={kpi.label} className="rounded-xl border border-white/10 bg-white/[0.06] p-5">
                    <div className="grid h-11 w-11 place-items-center rounded-lg bg-blue-500/15 text-blue-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-5 text-xs font-bold uppercase tracking-wide text-slate-500">{kpi.label}</p>
                    <p className="mt-2 break-words text-3xl font-black leading-tight">{kpi.value}</p>
                  </div>
                );
              })}
            </div>

            <ModuleContent page={page} customers={customers} analytics={analytics} stats={stats} />
          </div>
        </section>
      </div>
    </main>
  );
}