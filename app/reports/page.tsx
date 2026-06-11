"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

import {
  BadgeDollarSign,
  Bell,
  BrainCircuit,
  Download,
  FileBarChart,
  FileSpreadsheet,
  Home,
  MessageSquareText,
  Search,
  Settings,
  ShieldAlert,
  Users,
  WandSparkles
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

if (!API_BASE) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured.");
}

const sidebar = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Predictions", href: "/predictions", icon: BrainCircuit },
  { label: "Revenue", href: "/revenue", icon: BadgeDollarSign },
  { label: "AI Insights", href: "/insights", icon: MessageSquareText },
  { label: "Recommendations", href: "/recommendations", icon: WandSparkles },
  { label: "Reports", href: "/reports", icon: FileBarChart },
  { label: "Settings", href: "/settings", icon: Settings }
];

const reports = [
  {
    title: "Churn Risk Report",
    description:
      "Executive churn summary with total customers, high-risk customers, expected churn rate, revenue at risk, low satisfaction, and inactive customers.",
    endpoint: `${API_BASE}/reports/churn`,
    filename: "retentioniq_churn_risk_report.csv",
    icon: ShieldAlert,
    color: "text-red-300",
    bg: "bg-red-500/15"
  },
  {
    title: "Customer Prediction Report",
    description:
      "Full customer-level prediction export including churn probability, risk level, card type, geography, salary, and prediction status.",
    endpoint: `${API_BASE}/reports/customers`,
    filename: "retentioniq_customer_prediction_report.csv",
    icon: FileSpreadsheet,
    color: "text-blue-300",
    bg: "bg-blue-500/15"
  },
  {
    title: "Revenue At Risk Report",
    description:
      "Revenue exposure report for high-risk customers with priority levels and estimated value at risk.",
    endpoint: `${API_BASE}/reports/revenue`,
    filename: "retentioniq_revenue_at_risk_report.csv",
    icon: BadgeDollarSign,
    color: "text-emerald-300",
    bg: "bg-emerald-500/15"
  }
];

export default function ReportsPage() {
  const { getToken } = useAuth();

  async function downloadReport(endpoint: string, filename: string) {
    const token = await getToken();

    if (!token) {
      alert("Please sign in again before downloading reports.");
      return;
    }

    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const message = await res.text().catch(() => "");
      alert(message || "Report download failed. Please try again.");
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  }

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
              <p className="text-xs text-slate-500">Reports Center</p>
            </div>
          </div>

          <nav className="mt-8 space-y-1">
            {sidebar.map((item) => {
              const Icon = item.icon;
              const active = item.href === "/reports";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${
                    active
                      ? "bg-blue-500/15 text-blue-200"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
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
                <p className="text-sm text-slate-500">Analytics Reports</p>
                <h2 className="font-black">RetentionIQ Reports</h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden h-10 w-80 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-slate-500 md:flex">
                  <Search className="h-4 w-4" />
                  Search reports...
                </div>

                <button
                  type="button"
                  className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-300"
                >
                  <Bell className="h-4 w-4" />
                </button>
              </div>
            </div>
          </header>

          <div className="px-5 py-8 lg:px-8">
            <div className="mb-8">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-400">
                Export Center
              </p>
              <h1 className="mt-2 text-4xl font-black">
                Download business-ready reports
              </h1>
              <p className="mt-2 max-w-3xl text-slate-400">
                Generate CSV reports directly from prediction records saved in Neon PostgreSQL.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {reports.map((report) => {
                const Icon = report.icon;

                return (
                  <section
                    key={report.title}
                    className="rounded-xl border border-white/10 bg-white/[0.06] p-6 transition hover:-translate-y-1 hover:border-blue-400/40 hover:bg-white/[0.08]"
                  >
                    <div
                      className={`grid h-14 w-14 place-items-center rounded-lg ${report.bg} ${report.color}`}
                    >
                      <Icon className="h-7 w-7" />
                    </div>

                    <h3 className="mt-5 text-xl font-black">
                      {report.title}
                    </h3>

                    <p className="mt-3 min-h-24 text-sm leading-6 text-slate-400">
                      {report.description}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        downloadReport(report.endpoint, report.filename)
                      }
                      className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-bold transition hover:bg-blue-500"
                    >
                      <Download className="h-4 w-4" />
                      Download CSV
                    </button>
                  </section>
                );
              })}
            </div>

            <section className="mt-6 rounded-xl border border-white/10 bg-white/[0.06] p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-black">Report Source</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    These reports are generated from prediction records stored in Neon PostgreSQL after CSV upload and model inference.
                  </p>
                </div>

                <Link
                  href="/upload"
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-white/10 px-4 text-sm font-bold text-slate-200 hover:bg-white/5"
                >
                  Upload New Dataset
                </Link>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
