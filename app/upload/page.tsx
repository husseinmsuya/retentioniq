"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  ShieldCheck,
  Trash2,
  Upload,
  WandSparkles
} from "lucide-react";
const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

if (!API_BASE) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured.");
}

const MODEL_FEATURES = [
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

const templateRows = [
  MODEL_FEATURES.join(","),
  "650,France,Male,35,5,50000,2,1,1,4,Gold,1200,85000",
  "720,Germany,Female,42,8,120000,1,1,0,2,Platinum,1800,120000"
];

type DataQualityReport = {
  rowsProcessed: number;
  missingValuesDetected: boolean;
  missingValues: Record<string, number>;
  message: string;
};

type UploadResult = {
  customers: number;
  predictions: number;
  highRisk: number;
  revenueAtRisk: number;
  dataQualityReport?: DataQualityReport;
};

type HistoryItem = {
  fileName: string;
  uploadDate: string;
  records: number;
  predictions: number;
  status: string;
};

function formatTZS(value: number) {
  return `TZS ${Math.round(Number(value || 0)).toLocaleString()}`;
}

function parseCsv(text: string) {
  const rows = text.trim().split(/\r?\n/);
  const headers = rows[0].split(",").map((h) => h.trim());
  const dataRows = rows.slice(1).filter(Boolean);
  return { headers, dataRows };
}

function reorderCsv(headers: string[], dataRows: string[]) {
  const headerIndex = new Map(headers.map((h, i) => [h, i]));

  const reorderedRows = dataRows.map((row) => {
    const values = row.split(",").map((v) => v.trim());

    return MODEL_FEATURES.map((feature) => {
      const index = headerIndex.get(feature);
      return index === undefined ? "" : values[index] ?? "";
    }).join(",");
  });

  return [MODEL_FEATURES.join(","), ...reorderedRows].join("\n");
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 break-words text-2xl font-black leading-tight">{value}</p>
    </div>
  );
}

function DataQualityCard({ report }: { report: DataQualityReport }) {
  const missingEntries = Object.entries(report.missingValues || {});

  return (
    <div
      className={`mt-6 rounded-2xl border p-6 ${
        report.missingValuesDetected
          ? "border-amber-500/25 bg-amber-500/10"
          : "border-emerald-500/20 bg-emerald-500/10"
      }`}
    >
      <div className="flex items-start gap-3">
        {report.missingValuesDetected ? (
          <AlertTriangle className="mt-1 h-6 w-6 text-amber-300" />
        ) : (
          <ShieldCheck className="mt-1 h-6 w-6 text-emerald-300" />
        )}

        <div>
          <h3 className="text-xl font-black">Data Quality Report</h3>
          <p className="mt-1 text-sm text-slate-300">
            Rows Processed: {report.rowsProcessed.toLocaleString()}
          </p>
        </div>
      </div>

      {report.missingValuesDetected ? (
        <div className="mt-5">
          <p className="font-bold text-amber-200">Missing Values Detected</p>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {missingEntries.map(([column, count]) => (
              <div key={column} className="rounded-lg border border-amber-400/15 bg-black/25 px-4 py-3">
                <p className="text-sm text-slate-400">{column}</p>
                <p className="mt-1 text-2xl font-black text-amber-200">{count.toLocaleString()}</p>
              </div>
            ))}
          </div>

          <p className="mt-4 text-sm text-slate-300">{report.message}</p>
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-300">{report.message}</p>
      )}
    </div>
  );
}

export default function UploadCustomerDataPage() {
  const { getToken } = useAuth();

  const [error, setError] = useState<string[]>([]);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    const savedHistory = localStorage.getItem("retentioniq_upload_history");

    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }

    async function loadSummary() {
      try {
        const token = await getToken();

        const res = await fetch(`${API_BASE}/predictions/summary`, {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();
        setSavedCount(Number(data.totalCustomers || 0));
      } catch {
        setSavedCount(0);
      }
    }

    loadSummary();
  }, [getToken]);

  function persistHistory(nextHistory: HistoryItem[]) {
    setHistory(nextHistory);
    localStorage.setItem("retentioniq_upload_history", JSON.stringify(nextHistory));
  }

  function downloadTemplate() {
    const blob = new Blob([templateRows.join("\n")], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "retentioniq_customer_template.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  async function processFile(file: File) {
    setError([]);
    setResult(null);

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError(["Only CSV files are supported."]);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(["File size exceeds 10MB limit."]);
      return;
    }

    setProcessing(true);

    try {
      const text = await file.text();
      const { headers, dataRows } = parseCsv(text);

      const missingColumns = MODEL_FEATURES.filter((feature) => !headers.includes(feature));

      if (missingColumns.length > 0) {
        setError(missingColumns);
        return;
      }

      const token = await getToken();

      if (!token) {
        throw new Error("Authentication token missing. Please sign in again.");
      }

      const reorderedCsv = reorderCsv(headers, dataRows);

      const formData = new FormData();
      formData.append("file", new Blob([reorderedCsv], { type: "text/csv" }), file.name);

      const response = await fetch(`${API_BASE}/predictions/upload-csv`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail || "Prediction request failed.");
      }

      const customersImported = Number(data.customersImported ?? data.customers?.length ?? 0);
      const predictionsGenerated = Number(data.predictionsGenerated ?? customersImported);
      const highRisk = Number(data.highRiskCustomers ?? data.summary?.highRiskCustomers ?? 0);
      const revenueAtRisk = Number(data.estimatedRevenueAtRisk ?? data.summary?.revenueAtRisk ?? 0);

      setSavedCount(Number(data.summary?.totalCustomers ?? customersImported));

      setResult({
        customers: customersImported,
        predictions: predictionsGenerated,
        highRisk,
        revenueAtRisk,
        dataQualityReport: data.dataQualityReport
      });

      persistHistory([
        {
          fileName: file.name,
          uploadDate: new Date().toLocaleString(),
          records: customersImported,
          predictions: predictionsGenerated,
          status: data.dataQualityReport?.missingValuesDetected ? "Processed with warnings" : "Processed"
        },
        ...history
      ]);
    } catch (err) {
      setError([err instanceof Error ? err.message : "Upload failed."]);
    } finally {
      setProcessing(false);
    }
  }

  function handleFileInput(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      processFile(file);
    }
  }

  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-400">Upload Data</p>
            <h1 className="mt-2 text-4xl font-black">Upload Customer Data</h1>
            <p className="mt-2 max-w-3xl text-slate-400">
              Upload customer data, validate model features, run predictions, then save results to Neon for dashboard, reports, and AI Insights.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Saved prediction records in Neon: {savedCount.toLocaleString()}
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold hover:bg-white/10"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);

              const file = event.dataTransfer.files?.[0];

              if (file) {
                processFile(file);
              }
            }}
            className={`grid min-h-[330px] place-items-center rounded-2xl border border-dashed p-8 text-center ${
              dragging ? "border-blue-400 bg-blue-500/10" : "border-white/15 bg-white/[0.06]"
            }`}
          >
            <div>
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-500/15 text-blue-300">
                <Upload className="h-8 w-8" />
              </div>

              <h2 className="mt-5 text-2xl font-black">Upload Customer Dataset</h2>

              <p className="mt-2 text-slate-400">Drag & Drop CSV file here</p>
              <p className="mt-1 text-sm text-slate-500">or</p>

              <label className="mt-5 inline-flex cursor-pointer rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold shadow-lg shadow-blue-950/30 hover:from-blue-500 hover:to-indigo-500">
                Browse Files
                <input type="file" accept=".csv" className="hidden" onChange={handleFileInput} />
              </label>

              <div className="mt-6 flex justify-center gap-6 text-sm text-slate-500">
                <span>Format: CSV</span>
                <span>Max Size: 10MB</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6">
            <h3 className="text-xl font-black">Dataset Requirements</h3>
            <p className="mt-2 text-sm text-slate-400">Your CSV must contain these exact model features.</p>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {MODEL_FEATURES.map((feature) => (
                <div key={feature} className="rounded-lg bg-black/30 px-3 py-2 text-sm text-slate-300">
                  {feature}
                </div>
              ))}
            </div>

            <button
              onClick={downloadTemplate}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold hover:bg-white/10"
            >
              <Download className="h-4 w-4" />
              Download Template
            </button>
          </div>
        </div>

        {processing && (
          <div className="mt-6 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-6">
            <div className="flex items-center gap-3">
              <WandSparkles className="h-5 w-5 animate-pulse text-blue-300" />
              <div>
                <p className="font-bold">Checking Dataset...</p>
                <p className="text-sm text-slate-400">
                  Validating columns, checking missing values, running predictions, and saving results to Neon.
                </p>
              </div>
            </div>
          </div>
        )}

        {error.length > 0 && (
          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-300" />
              <div>
                <h3 className="text-xl font-black">Upload Failed</h3>
                <p className="text-sm text-slate-300">Missing Columns / Error:</p>
              </div>
            </div>

            <ul className="mt-4 list-disc space-y-1 pl-6 text-red-200">
              {error.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <p className="mt-4 text-sm text-slate-400">Please download and use the provided template.</p>
          </div>
        )}

        {result && (
          <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-7 w-7 text-emerald-300" />
              <h3 className="text-2xl font-black">Dataset Successfully Processed</h3>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <Metric label="Customers Imported" value={result.customers.toLocaleString()} />
              <Metric label="Predictions Generated" value={result.predictions.toLocaleString()} />
              <Metric label="High-Risk Customers" value={result.highRisk.toLocaleString()} />
              <Metric label="Estimated Revenue at Risk" value={formatTZS(result.revenueAtRisk)} />
            </div>

            {result.dataQualityReport && <DataQualityCard report={result.dataQualityReport} />}

            <div className="mt-6 flex flex-wrap gap-3">
              <Link className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold hover:bg-blue-500" href="/dashboard">
                View Dashboard
              </Link>

              <Link className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold hover:bg-white/10" href="/insights">
                Ask AI Insights
              </Link>

              <Link className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold hover:bg-white/10" href="/reports">
                Generate Report
              </Link>

              <button
                onClick={() => {
                  setResult(null);
                  setError([]);
                }}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold hover:bg-white/10"
              >
                Upload Another Dataset
              </button>
            </div>
          </div>
        )}

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.06] p-6">
          <h3 className="text-xl font-black">Upload History</h3>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  {["File Name", "Upload Date", "Records Imported", "Predictions Generated", "Status", "Actions"].map((h) => (
                    <th key={h} className="border-b border-white/10 px-3 py-3">{h}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-12 text-center text-slate-500">
                      No upload history yet.
                    </td>
                  </tr>
                ) : (
                  history.map((item) => (
                    <tr key={`${item.fileName}-${item.uploadDate}`} className="border-b border-white/5">
                      <td className="px-3 py-3 font-semibold">{item.fileName}</td>
                      <td className="px-3 py-3">{item.uploadDate}</td>
                      <td className="px-3 py-3">{item.records.toLocaleString()}</td>
                      <td className="px-3 py-3">{item.predictions.toLocaleString()}</td>
                      <td className={`px-3 py-3 ${item.status.includes("warnings") ? "text-amber-300" : "text-emerald-300"}`}>
                        {item.status}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-2">
                          <Link href="/dashboard" className="rounded-md bg-white/5 px-3 py-1 hover:bg-white/10">
                            View
                          </Link>

                          <Link href="/reports" className="rounded-md bg-white/5 px-3 py-1 hover:bg-white/10">
                            Report
                          </Link>

                          <button
                            onClick={() => persistHistory(history.filter((h) => h !== item))}
                            className="rounded-md bg-red-500/10 px-3 py-1 text-red-300 hover:bg-red-500/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}
