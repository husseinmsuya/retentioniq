"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, BadgeDollarSign, BrainCircuit, ShieldAlert, WandSparkles } from "lucide-react";
import { loadPredictions, recommendationsFor } from "@/lib/retention-data";

export default function CustomerDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const customers = loadPredictions();
  const customer = customers.find((c) => c.id === id);

  if (!customer) {
    return (
      <main className="grid min-h-screen place-items-center bg-black p-6 text-white">
        <div className="text-center">
          <h1 className="text-3xl font-black">Customer not found</h1>
          <Link href="/customers" className="mt-5 inline-block text-blue-300">
            Back to customers
          </Link>
        </div>
      </main>
    );
  }

  const actions = recommendationsFor(customer);

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <section className="mx-auto max-w-6xl">
        <Link href="/customers" className="inline-flex items-center gap-2 text-sm font-bold text-blue-300">
          <ArrowLeft className="h-4 w-4" />
          Back to Customers
        </Link>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.06] p-8">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-400">Customer Profile</p>
          <h1 className="mt-2 text-4xl font-black">{customer.name}</h1>
          <p className="mt-2 text-slate-400">Customer ID: {customer.id}</p>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <Metric icon={<ShieldAlert className="h-5 w-5" />} label="Risk Score" value={`${customer.churnProbability}%`} />
            <Metric icon={<BrainCircuit className="h-5 w-5" />} label="Risk Level" value={customer.riskLevel} />
            <Metric icon={<BadgeDollarSign className="h-5 w-5" />} label="Estimated Salary" value={`$${customer.EstimatedSalary.toLocaleString()}`} />
            <Metric icon={<WandSparkles className="h-5 w-5" />} label="Prediction" value={customer.prediction} />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-black/30 p-6">
              <h2 className="text-xl font-black">AI Explanation</h2>
              <p className="mt-4 leading-7 text-slate-300">
                This customer has a predicted churn probability of {customer.churnProbability}%.
               
                {customer.SatisfactionScore <= 2 ? " Their satisfaction score is low." : ""}
                {customer.IsActiveMember === 0 ? " They are currently inactive." : ""}
                These factors increase churn risk and should be reviewed by the retention team.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/30 p-6">
              <h2 className="text-xl font-black">Recommended Actions</h2>
              <div className="mt-4 space-y-3">
                {actions.map((action) => (
                  <div key={action} className="rounded-lg bg-emerald-500/10 p-3 text-emerald-200">
                    {action}
                  </div>
                ))}
              </div>
              <p className="mt-5 text-sm text-slate-400">Potential retention improvement: 18%</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-5">
      <div className="text-blue-300">{icon}</div>
      <p className="mt-4 text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}