"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeDollarSign,
  BarChart3,
  BrainCircuit,
  Check,
  ChevronDown,
  FileBarChart,
  LineChart,
  LockKeyhole,
  Mail,
  Menu,
  MessageSquareText,
  PieChart,
  ShieldCheck,
  Sparkles,
  Target,
  UploadCloud,
  Users,
  WandSparkles,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const navItems = ["Features", "Solutions", "Workflow", "Pricing", "Company"];

const heroImage =
  "https://images.unsplash.com/photo-1556745757-8d76bdb6984b?auto=format&fit=crop&w=1800&q=90";

const featureCards = [
  { title: "CSV Data Upload", body: "Upload datasets, validate columns, detect missing values, and prepare model input.", icon: UploadCloud },
  { title: "Churn Prediction", body: "Score every customer using your trained churn model, scaler, and feature schema.", icon: BrainCircuit },
  { title: "Revenue at Risk", body: "Convert churn probability into financial exposure for faster prioritization.", icon: BadgeDollarSign },
  { title: "Customer Intelligence", body: "Review risk levels, segments, geography, card type, and high-risk accounts.", icon: Users },
  { title: "AI Insights", body: "Ask questions about uploaded prediction data and get grounded answers.", icon: MessageSquareText },
  { title: "Retention Actions", body: "Turn risk signals into loyalty offers, campaigns, and manager follow-ups.", icon: WandSparkles },
  { title: "Reports Center", body: "Export churn, customer prediction, and revenue-at-risk reports.", icon: FileBarChart },
  { title: "Secure Workspace", body: "Built for authenticated teams, protected routes, and database-backed analytics.", icon: LockKeyhole },
];

const solutions = [
  { title: "Retention Managers", body: "Know exactly which customers need attention today.", icon: Target },
  { title: "Financial Teams", body: "Understand how churn risk affects revenue exposure.", icon: ShieldCheck },
  { title: "Analytics Teams", body: "Move from uploaded CSV to model output and dashboards.", icon: BarChart3 },
  { title: "Executives", body: "See clean summaries, reports, and AI explanations.", icon: LineChart },
];

const workflow = [
  { title: "Upload Dataset", body: "Import customer CSV data with the exact model features.", icon: UploadCloud },
  { title: "Validate Quality", body: "Check required columns, missing values, and data quality warnings.", icon: ShieldCheck },
  { title: "Run Prediction", body: "Use your backend model and scaler to score every customer.", icon: BrainCircuit },
  { title: "Analyze Risk", body: "Visualize churn probability, segments, risk levels, and revenue exposure.", icon: PieChart },
  { title: "Ask AI", body: "Ask questions about churn, revenue, geography, and retention priorities.", icon: MessageSquareText },
  { title: "Act & Report", body: "Recommend retention actions and export business-ready reports.", icon: FileBarChart },
];

function smoothScrollTo(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
        <Sparkles className="h-4 w-4" />
      </span>
      <span className="text-lg font-black tracking-tight">RetentionIQ</span>
    </Link>
  );
}

function DemoModal({ onClose }: { onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ email: "", company: "" });

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 text-white shadow-2xl"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
        {submitted ? (
          <div>
            <h2 className="text-xl font-black">Demo Request Submitted</h2>
            <p className="mt-3 text-sm text-slate-300">
              Thank you. A specialist would contact you within 24 hours.
            </p>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-bold hover:bg-blue-500"
            >
              Launch Interactive Demo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-black">Book a product demo</h2>
            <p className="mt-1 text-sm text-slate-400">Schedule a walkthrough for your retention team.</p>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Work email"
              type="email"
              className="mt-6 h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm outline-none placeholder:text-slate-500 focus:border-blue-400"
            />
            <input
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              placeholder="Company name"
              className="mt-3 h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm outline-none placeholder:text-slate-500 focus:border-blue-400"
            />
            <button
              onClick={() => form.email && form.company && setSubmitted(true)}
              className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-bold hover:bg-blue-500"
            >
              Request Demo <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [demoOpen, setDemoOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((c) => (c + 1) % workflow.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("is-visible")),
      { threshold: 0.14, rootMargin: "0px 0px -80px 0px" }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const active = workflow[activeStep];
  const ActiveIcon = active.icon;

  return (
    <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const id = item.toLowerCase() === "workflow" ? "workflow" : item.toLowerCase();
              return (
                <button
                  key={item}
                  onClick={() => smoothScrollTo(id)}
                  className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                >
                  {item}
                  {["Solutions", "Company"].includes(item) && <ChevronDown className="h-3 w-3" />}
                </button>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/dashboard"
              className="hidden h-10 items-center rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 sm:inline-flex dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="hidden h-10 items-center rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 md:inline-flex"
            >
              Start Free Trial
            </Link>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 lg:hidden dark:border-white/10"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden dark:border-white/10 dark:bg-slate-950">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const id = item.toLowerCase();
                return (
                  <button
                    key={item}
                    onClick={() => {
                      smoothScrollTo(id);
                      setMobileOpen(false);
                    }}
                    className="rounded-lg px-3 py-2.5 text-left text-sm font-bold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5"
                  >
                    {item}
                  </button>
                );
              })}
              <Link
                href="/dashboard"
                className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section id="home" className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center opacity-20 dark:opacity-30"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-white/80 to-white dark:from-slate-950 dark:via-slate-950/80 dark:to-slate-950" />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
          <div className="hero-card mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
              <Sparkles className="h-3 w-3" /> Enterprise AI Customer Churn Platform
            </span>
            <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Predict Churn Before Your Best Customers Leave
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-slate-600 sm:text-lg dark:text-slate-300">
              Upload customer data, run predictions, understand revenue at risk, and turn churn signals into retention actions.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-black text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 sm:w-auto"
              >
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                onClick={() => setDemoOpen(true)}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 text-sm font-black text-slate-800 hover:bg-slate-50 sm:w-auto dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                <CalendarIcon /> Book a Demo
              </button>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              {["No mock results", "Backend model workflow", "Database-backed analytics"].map((i) => (
                <span key={i} className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-500" /> {i}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center" data-reveal>
          <p className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Features</p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">Built for real churn prediction work</h2>
          <p className="mt-3 text-sm text-slate-600 sm:text-base dark:text-slate-400">
            Everything a retention team needs: upload, prediction, risk analytics, AI insights, recommendations, and reports.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featureCards.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                data-reveal
                style={{ ["--delay" as any]: `${i * 60}ms` }}
                className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-950/5 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-blue-500/40"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-black">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{f.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* SOLUTIONS */}
      <section id="solutions" className="border-y border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.02]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:gap-16">
          <div data-reveal>
            <p className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Solutions</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">For teams that cannot afford silent churn</h2>
            <p className="mt-3 text-sm text-slate-600 sm:text-base dark:text-slate-400">
              RetentionIQ gives managers and analysts a clean workflow for identifying who is at risk, why it matters, and what to do next.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Detect high-risk customers early",
                "Prioritize revenue exposure",
                "Explain churn patterns clearly",
                "Export business-ready reports",
              ].map((i) => (
                <li key={i} className="flex items-start gap-3 text-sm font-semibold">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> {i}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {solutions.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  data-reveal
                  style={{ ["--delay" as any]: `${i * 80}ms` }}
                  className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900/60"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-base font-black">{s.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{s.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section id="workflow" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center" data-reveal>
          <p className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Platform Workflow</p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">From raw customer data to retention action</h2>
          <p className="mt-3 text-sm text-slate-600 sm:text-base dark:text-slate-400">
            The visual changes with each step so the workflow feels alive and easy to understand.
          </p>
        </div>
        <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div data-reveal className="order-1 lg:order-none">
            <div className="float-image relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-500 to-indigo-700 p-8 text-white shadow-2xl shadow-blue-500/20 dark:border-white/10">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                <ActiveIcon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-2xl font-black">{active.title}</h3>
              <p className="mt-2 text-sm text-blue-100">{active.body}</p>
              <div className="mt-8 flex gap-1.5">
                {workflow.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition ${i === activeStep ? "bg-white" : "bg-white/30"}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {workflow.map((step, i) => {
              const Icon = step.icon;
              const isActive = activeStep === i;
              return (
                <button
                  key={step.title}
                  onClick={() => setActiveStep(i)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    isActive
                      ? "border-blue-400 bg-blue-50 shadow-lg dark:border-blue-500/50 dark:bg-blue-500/10"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        Step 0{i + 1}
                      </p>
                      <h4 className="mt-0.5 text-sm font-black">{step.title}</h4>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{step.body}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="border-y border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-2xl text-center" data-reveal>
            <p className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Pricing</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">Simple plans for serious retention teams</h2>
            <p className="mt-3 text-sm text-slate-600 sm:text-base dark:text-slate-400">
              Start lean, then scale into advanced controls as your retention operation grows.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {["Starter", "Growth", "Enterprise"].map((plan, i) => (
              <div
                key={plan}
                data-reveal
                style={{ ["--delay" as any]: `${i * 100}ms` }}
                className={`rounded-2xl border p-6 ${
                  i === 1
                    ? "border-blue-400 bg-white shadow-2xl shadow-blue-500/10 dark:border-blue-500/50 dark:bg-slate-900"
                    : "border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900/60"
                }`}
              >
                {i === 1 && (
                  <span className="inline-block rounded-full bg-blue-600 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                    Most Popular
                  </span>
                )}
                <h3 className="mt-3 text-2xl font-black">{plan}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  {i === 0
                    ? "For teams validating churn prediction workflows."
                    : i === 1
                      ? "For analytics teams running retention campaigns."
                      : "For multi-team organizations with advanced controls."}
                </p>
                <p className="mt-6 text-4xl font-black">Contact</p>
                <button
                  onClick={() => setDemoOpen(true)}
                  className={`mt-6 h-11 w-full rounded-xl text-sm font-bold ${
                    i === 1
                      ? "bg-blue-600 text-white hover:bg-blue-500"
                      : "border border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-transparent dark:hover:bg-white/5"
                  }`}
                >
                  Request Demo
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPANY */}
      <section id="company" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div data-reveal>
            <p className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Company</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">Designed to feel like an international analytics SaaS</h2>
          </div>
          <div className="grid gap-4">
            {[
              ["Real Workflow", "Upload, predict, analyze, ask AI, recommend, and report."],
              ["Clean UI", "No random logos, no clutter, no fake customer results."],
              ["Production Direction", "Built around backend model artifacts and database records."],
            ].map(([t, b], i) => (
              <div
                key={t}
                data-reveal
                style={{ ["--delay" as any]: `${i * 80}ms` }}
                className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <h3 className="text-base font-black">{t}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <Logo />
          <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-black sm:text-4xl">
            Turn customer data into retention strategies
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-300 sm:text-base">
            AI-driven churn prediction and actionable insights — built for retention teams.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={() => setDemoOpen(true)}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 text-sm font-black text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 sm:w-auto"
            >
              <Mail className="h-4 w-4" /> Contact Sales
            </button>
            <button
              onClick={() => setDemoOpen(true)}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-emerald-400 px-6 text-sm font-black text-emerald-100 hover:bg-emerald-500/10 sm:w-auto"
            >
              Book a Demo
            </button>
          </div>
          <div className="mt-10 flex flex-col items-center gap-2 text-sm text-slate-300 sm:flex-row sm:justify-center sm:gap-8">
            <span className="inline-flex items-center gap-2">☎ +255 682 751 790</span>
            <a href="mailto:husseinmsuya898@gmail.com" className="inline-flex items-center gap-2 hover:text-white">
              <Mail className="h-4 w-4 text-emerald-400" /> husseinmsuya898@gmail.com
            </a>
          </div>
          <p className="mt-10 text-xs text-slate-500">© 2026 RetentionIQ. All rights reserved.</p>
        </div>
      </section>

      {demoOpen && <DemoModal onClose={() => setDemoOpen(false)} />}
    </main>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}
