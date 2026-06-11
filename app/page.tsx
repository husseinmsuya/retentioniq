"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  ArrowRight,
  BadgeDollarSign,
  BarChart3,
  BrainCircuit,
  CalendarDays,
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
  X
} from "lucide-react";

const navItems = ["Features", "Solutions", "Workflow", "Pricing", "Company"];

const heroImage =
  "https://images.unsplash.com/photo-1556745757-8d76bdb6984b?auto=format&fit=crop&w=1800&q=90";

const featureCards = [
  {
    title: "CSV Data Upload",
    body: "Upload datasets, validate columns, detect missing values, and prepare model input.",
    icon: UploadCloud,
    image: "/features/csv.jpg"
  },
  {
    title: "Churn Prediction",
    body: "Score every customer using your trained churn model, scaler, and feature schema.",
    icon: BrainCircuit,
    image: "/features/ai-brain.jpg"
  },
  {
    title: "Revenue at Risk",
    body: "Convert churn probability into financial exposure for faster prioritization.",
    icon: BadgeDollarSign,
    image: "/features/revenue.jpg"
  },
  {
    title: "Customer Intelligence",
    body: "Review risk levels, customer segments, geography, card type, and high-risk accounts.",
    icon: Users,
    image: "/features/customer-inteligence.jpg"
  },
  {
    title: "AI Insights",
    body: "Ask questions about uploaded prediction data and get grounded answers.",
    icon: MessageSquareText,
    image: "/features/customer.jpg"
  },
  {
    title: "Retention Actions",
    body: "Turn risk signals into loyalty offers, campaigns, and manager follow-ups.",
    icon: WandSparkles,
    image: "/features/retention.jpg"
  },
  {
    title: "Reports Center",
    body: "Export churn, customer prediction, and revenue-at-risk reports from Neon.",
    icon: FileBarChart,
    image: "/features/reports.jpg"
  },
  {
    title: "Secure Workspace",
    body: "Built for authenticated teams, protected routes, and database-backed analytics.",
    icon: LockKeyhole,
    image: "/features/security.jpg"
  }
];

const solutions = [
  { title: "Retention Managers", body: "Know exactly which customers need attention today.", icon: Target },
  { title: "Financial Teams", body: "Understand how churn risk affects revenue exposure.", icon: ShieldCheck },
  { title: "Analytics Teams", body: "Move from uploaded CSV to model output and dashboards.", icon: BarChart3 },
  { title: "Executives", body: "See clean summaries, reports, and AI explanations.", icon: LineChart }
];

const workflow = [
  {
    title: "Upload Dataset",
    body: "Import customer CSV data with the exact model features.",
    icon: UploadCloud,
    image: "/features/csv.jpg"
  },
  {
    title: "Validate Quality",
    body: "Check required columns, missing values, and data quality warnings.",
    icon: ShieldCheck,
    image: "/features/customer-inteligence.jpg"
  },
  {
    title: "Run Prediction",
    body: "Use your backend model and scaler to score every customer.",
    icon: BrainCircuit,
    image: "/features/ai-brain.jpg"
  },
  {
    title: "Analyze Risk",
    body: "Visualize churn probability, segments, risk levels, and revenue exposure.",
    icon: PieChart,
    image: "/features/revenue.jpg"
  },
  {
    title: "Ask AI",
    body: "Ask questions about churn, revenue, geography, and retention priorities.",
    icon: MessageSquareText,
    image: "/features/customer.jpg"
  },
  {
    title: "Act & Report",
    body: "Recommend retention actions and export business-ready reports.",
    icon: FileBarChart,
    image: "/features/reports.jpg"
  }
];

function smoothScrollTo(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-900/30">
        <span className="flex h-5 items-end gap-0.5">
          <span className="h-2 w-1.5 rounded-sm bg-white/75" />
          <span className="h-4 w-1.5 rounded-sm bg-white/90" />
          <span className="h-5 w-1.5 rounded-sm bg-white" />
        </span>
      </div>
      <span className="text-xl font-black tracking-tight">
        Retention<span className="text-blue-500">IQ</span>
      </span>
    </Link>
  );
}

function DemoModal({
  onClose,
  isSignedIn
}: {
  onClose: () => void;
  isSignedIn: boolean;
}) {
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [demoForm, setDemoForm] = useState({
    email: "",
    company: ""
  });

  function submitDemoRequest() {
    if (!demoForm.email.trim() || !demoForm.company.trim()) return;
    setDemoSubmitted(true);
  }

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-black/70 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-950 p-8 text-white shadow-2xl shadow-blue-950/40"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-6">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-500/15 text-blue-300">
            <CalendarDays className="h-7 w-7" />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 hover:bg-white/10"
            aria-label="Close demo modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {demoSubmitted ? (
          <div className="mt-8">
            <h3 className="text-3xl font-black">Demo Request Submitted</h3>

            <p className="mt-5 text-base leading-7 text-slate-300">
              Thank you for your interest in RetentionIQ.
            </p>

            <p className="mt-4 text-base leading-7 text-slate-300">
              A product specialist would typically contact you within 24 hours to schedule a
              personalized walkthrough.
            </p>

            <p className="mt-4 text-base leading-7 text-slate-300">
              For this portfolio demonstration, you can explore the platform instantly and upload
              your own customer dataset.
            </p>

            <Link
              href={isSignedIn ? "/dashboard" : "/sign-up"}
              className="mt-7 inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-black text-white hover:bg-blue-500"
            >
              Launch Interactive Demo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-8">
            <h3 className="text-3xl font-black">Book a product demo</h3>
            <p className="mt-3 text-base text-slate-400">
              Schedule a walkthrough for your retention team.
            </p>

            <input
              value={demoForm.email}
              onChange={(event) =>
                setDemoForm((current) => ({ ...current, email: event.target.value }))
              }
              placeholder="Work email"
              type="email"
              className="mt-8 h-14 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none placeholder:text-slate-500 focus:border-blue-400"
            />

            <input
              value={demoForm.company}
              onChange={(event) =>
                setDemoForm((current) => ({ ...current, company: event.target.value }))
              }
              placeholder="Company name"
              className="mt-4 h-14 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none placeholder:text-slate-500 focus:border-blue-400"
            />

            <button
              type="button"
              onClick={submitDemoRequest}
              disabled={!demoForm.email.trim() || !demoForm.company.trim()}
              className="mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-black text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Request Demo
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const { isSignedIn } = useUser();
  const [demoOpen, setDemoOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((current) => (current + 1) % workflow.length);
    }, 3200);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll("[data-reveal]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -80px 0px" }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const activeWorkflow = workflow[activeStep];
  const ActiveWorkflowIcon = activeWorkflow.icon;

  return (
    <>
      <main id="top" className="min-h-screen overflow-hidden bg-white text-slate-950">
        <style jsx global>{`
          .hero-card {
            animation: hero-rise 900ms cubic-bezier(.16, 1, .3, 1) both;
          }

          [data-reveal] {
            opacity: 0;
            transform: translateY(38px);
            transition:
              opacity 950ms cubic-bezier(.16, 1, .3, 1),
              transform 950ms cubic-bezier(.16, 1, .3, 1);
            transition-delay: var(--delay, 0ms);
            will-change: opacity, transform;
          }

          [data-reveal="left"] {
            transform: translateX(-90px) translateY(28px);
          }

          [data-reveal="right"] {
            transform: translateX(90px) translateY(28px);
          }

          [data-reveal="up"] {
            transform: translateY(52px);
          }

          [data-reveal].is-visible {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }

          .feature-card {
            position: relative;
            overflow: hidden;
            background:
              linear-gradient(145deg, rgba(15, 23, 42, 0.98), rgba(15, 23, 42, 0.94)),
              #020617;
            transition:
              transform 320ms ease,
              border-color 320ms ease,
              box-shadow 320ms ease;
          }

          .feature-card::before {
            content: "";
            position: absolute;
            inset: 0;
            z-index: 2;
            pointer-events: none;
            background: linear-gradient(
              115deg,
              transparent 0%,
              rgba(255, 255, 255, 0.16) 45%,
              transparent 60%
            );
            transform: translateX(-130%);
            transition: transform 850ms ease;
          }

          .feature-card:hover::before {
            transform: translateX(130%);
          }

          .feature-card:hover {
            transform: translateY(-8px);
            border-color: rgba(59, 130, 246, 0.55);
            box-shadow: 0 24px 60px rgba(15, 23, 42, 0.24);
          }

          .premium-card {
            position: relative;
            overflow: hidden;
            transition:
              transform 320ms ease,
              border-color 320ms ease,
              box-shadow 320ms ease;
          }

          .premium-card:hover {
            transform: translateY(-10px);
            border-color: rgba(37, 99, 235, 0.35);
            box-shadow: 0 24px 70px rgba(15, 23, 42, 0.12);
          }

          .float-image {
            animation: float-image 7s ease-in-out infinite;
          }

          @keyframes hero-rise {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes float-image {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-12px);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            [data-reveal] {
              opacity: 1;
              transform: none;
              transition: none;
            }

            .hero-card,
            .float-image {
              animation: none;
            }
          }
        `}</style>

        <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Logo />

            <div className="hidden items-center gap-8 lg:flex">
              {navItems.map((item) => {
                const id = item.toLowerCase() === "workflow" ? "resources" : item.toLowerCase();

                return (
                  <button
                    key={item}
                    onClick={() => smoothScrollTo(id)}
                    className="flex items-center gap-1 text-sm font-bold text-slate-600 hover:text-blue-600"
                  >
                    {item}
                    {["Solutions", "Company"].includes(item) && (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/sign-in"
                className="hidden rounded-xl px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 sm:inline-flex"
              >
                Sign In
              </Link>

              <Link
                href={isSignedIn ? "/dashboard" : "/sign-up"}
                className="inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-900/20 hover:bg-blue-500"
              >
                Start Free Trial
              </Link>

              <button className="grid h-10 w-10 place-items-center rounded-xl text-slate-700 hover:bg-slate-100 lg:hidden">
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </nav>

        <section
          className="relative min-h-[720px] overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />

          <div className="relative mx-auto flex min-h-[720px] max-w-7xl items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
            <div className="hero-card max-w-4xl text-white">
              <div className="mx-auto inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur-xl">
                <Sparkles className="mr-2 h-4 w-4 text-blue-300" />
                Enterprise AI Customer Churn Platform
              </div>

              <h1 className="mx-auto mt-7 max-w-4xl text-5xl font-black leading-[1.02] tracking-tight md:text-7xl">
                Predict Churn Before Your Best Customers Leave
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-100 md:text-xl">
                Upload customer data, run predictions, understand revenue at risk, and turn churn signals into retention actions.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  href={isSignedIn ? "/dashboard" : "/sign-up"}
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-black text-white shadow-2xl shadow-blue-950/40 hover:bg-blue-500"
                >
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <button
                  onClick={() => setDemoOpen(true)}
                  className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 text-sm font-black text-white backdrop-blur-xl hover:bg-white/20"
                >
                  <CalendarDays className="h-4 w-4" />
                  Book a Demo
                </button>

                <button
                  onClick={() => smoothScrollTo("features")}
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-black/30 px-6 text-sm font-black text-white backdrop-blur-xl hover:bg-black/40"
                >
                  Explore Features
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-7 flex flex-wrap justify-center gap-6 text-sm font-semibold text-slate-100">
                {["No mock results", "Backend model workflow", "Database-backed analytics"].map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-300" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="bg-white px-4 py-24 sm:px-6 lg:px-8">
          <div data-reveal="up" className="mx-auto mb-12 max-w-3xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.26em] text-blue-600">
              Features
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
              Built for real churn prediction work
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Everything a retention team needs: upload, prediction, risk analytics, AI insights, recommendations, and reports.
            </p>
          </div>

          <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 xl:grid-cols-4">
            {featureCards.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  data-reveal={index % 2 === 0 ? "left" : "right"}
                  style={{ "--delay": `${index * 70}ms` } as React.CSSProperties}
                  className="feature-card group rounded-2xl border border-slate-800 shadow-lg shadow-slate-950/10"
                >
                  <div className="relative h-24 overflow-hidden rounded-t-2xl">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                    <div className="absolute bottom-2.5 left-3 grid h-9 w-9 place-items-center rounded-xl border border-white/15 bg-blue-500/20 text-white backdrop-blur-xl">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                  </div>

                  <div className="relative p-4">
                    <h3 className="text-base font-black text-white">{feature.title}</h3>
                    <p className="mt-2 min-h-[60px] text-xs leading-5 text-slate-400">
                      {feature.body}
                    </p>

                    <div className="mt-3 flex items-center gap-2 text-xs font-bold text-blue-300">
                      Learn more
                      <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section id="solutions" className="bg-slate-950 px-4 py-24 text-white sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div data-reveal="left">
              <p className="text-xs font-black uppercase tracking-[0.26em] text-blue-400">
                Solutions
              </p>
              <h2 className="mt-3 text-4xl font-black tracking-tight">
                For teams that cannot afford silent churn
              </h2>
              <p className="mt-4 max-w-xl leading-7 text-slate-400">
                RetentionIQ gives managers and analysts a clean workflow for identifying who is at risk, why it matters, and what to do next.
              </p>

              <div className="mt-7 space-y-3">
                {[
                  "Detect high-risk customers early",
                  "Prioritize revenue exposure",
                  "Explain churn patterns clearly",
                  "Export business-ready reports"
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 font-semibold text-slate-300">
                    <Check className="h-5 w-5 text-emerald-400" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {solutions.map((solution, index) => {
                const Icon = solution.icon;

                return (
                  <div
                    key={solution.title}
                    data-reveal={index % 2 === 0 ? "right" : "left"}
                    style={{ "--delay": `${index * 100}ms` } as React.CSSProperties}
                    className="premium-card rounded-3xl border border-white/10 bg-white/[0.06] p-7"
                  >
                    <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-blue-500/15 text-blue-300">
                      <Icon className="h-6 w-6" />
                    </div>

                    <h3 className="relative mt-6 font-black">{solution.title}</h3>
                    <p className="relative mt-3 text-sm leading-6 text-slate-400">{solution.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="resources" className="bg-slate-50 px-4 py-24 sm:px-6 lg:px-8">
          <div data-reveal="up" className="mx-auto mb-12 max-w-3xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.26em] text-blue-600">
              Platform Workflow
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
              From raw customer data to retention action
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              The image changes with each workflow step so the experience feels alive and easy to understand.
            </p>
          </div>

          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div data-reveal="left">
              <div
                className="float-image min-h-[560px] overflow-hidden rounded-[2rem] border border-slate-200 bg-cover bg-center shadow-2xl shadow-slate-900/15"
                style={{ backgroundImage: `url(${activeWorkflow.image})` }}
              >
                <div className="flex min-h-[560px] items-end bg-gradient-to-t from-black/75 via-black/20 to-transparent p-8">
                  <div className="max-w-md text-white">
                    <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white/15 backdrop-blur-xl">
                      <ActiveWorkflowIcon className="h-7 w-7" />
                    </div>
                    <h3 className="text-3xl font-black">{activeWorkflow.title}</h3>
                    <p className="mt-3 leading-7 text-slate-100">{activeWorkflow.body}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {workflow.map((step, index) => {
                const Icon = step.icon;
                const active = activeStep === index;

                return (
                  <button
                    key={step.title}
                    onClick={() => setActiveStep(index)}
                    data-reveal={index % 2 === 0 ? "right" : "left"}
                    style={{ "--delay": `${index * 90}ms` } as React.CSSProperties}
                    className={`premium-card text-left rounded-3xl border p-5 transition ${
                      active
                        ? "border-blue-300 bg-white shadow-xl shadow-blue-950/10"
                        : "border-slate-200 bg-white/80 hover:bg-white"
                    }`}
                  >
                    <div className="relative flex gap-4">
                      <div
                        className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${
                          active ? "bg-blue-600 text-white" : "bg-slate-100 text-blue-600"
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>

                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                          Step 0{index + 1}
                        </p>
                        <h3 className="mt-1 text-lg font-black text-slate-950">{step.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{step.body}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section id="pricing" className="bg-white px-4 py-24 sm:px-6 lg:px-8">
          <div data-reveal="up" className="mx-auto mb-12 max-w-3xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.26em] text-blue-600">
              Pricing
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
              Simple plans for serious retention teams
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Start lean, then scale into advanced controls when your retention operation grows.
            </p>
          </div>

          <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
            {["Starter", "Growth", "Enterprise"].map((plan, index) => (
              <div
                key={plan}
                data-reveal={index % 2 === 0 ? "left" : "right"}
                style={{ "--delay": `${index * 100}ms` } as React.CSSProperties}
                className="premium-card rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
              >
                <h3 className="relative text-xl font-black">{plan}</h3>
                <p className="relative mt-3 text-sm leading-6 text-slate-600">
                  {index === 0
                    ? "For teams validating churn prediction workflows."
                    : index === 1
                      ? "For analytics teams running retention campaigns."
                      : "For multi-team organizations with advanced controls."}
                </p>
                <p className="relative mt-7 text-3xl font-black">Contact</p>
                <button
                  onClick={() => setDemoOpen(true)}
                  className={`relative mt-7 h-11 w-full rounded-xl text-sm font-bold ${
                    index === 1
                      ? "bg-blue-600 text-white hover:bg-blue-500"
                      : "border border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  Request Demo
                </button>
              </div>
            ))}
          </div>
        </section>

        <section id="company" className="bg-slate-950 px-4 py-24 text-white sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div data-reveal="left">
              <p className="text-xs font-black uppercase tracking-[0.26em] text-blue-400">
                Company
              </p>
              <h2 className="mt-3 text-4xl font-black tracking-tight">
                Designed to feel like an international analytics SaaS
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                ["Real Workflow", "Upload, predict, analyze, ask AI, recommend, and report."],
                ["Clean UI", "No random logos, no clutter, no fake customer results."],
                ["Production Direction", "Built around backend model artifacts and database records."]
              ].map(([title, body], index) => (
                <div
                  key={title}
                  data-reveal={index % 2 === 0 ? "right" : "left"}
                  style={{ "--delay": `${index * 100}ms` } as React.CSSProperties}
                  className="premium-card rounded-3xl border border-white/10 bg-white/[0.06] p-6"
                >
                  <h3 className="relative font-black">{title}</h3>
                  <p className="relative mt-3 text-sm leading-6 text-slate-400">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>      
          <footer className="bg-white">
          <div className="mx-auto max-w-none bg-emerald-950 px-6 py-16 text-emerald-50 shadow-2xl shadow-emerald-950/20 sm:px-10 lg:px-16">
            <div className="mx-auto max-w-3xl text-center">
      <div className="flex items-center justify-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-950/30">
          <Sparkles className="h-6 w-6" />
        </div>

        <h2 className="text-3xl font-black tracking-tight">
          Retention<span className="text-emerald-300">IQ</span>
        </h2>
      </div>

      <p className="mx-auto mt-7 max-w-2xl text-lg font-semibold leading-8 text-emerald-100">
        Turn customer data into retention strategies with AI-driven churn prediction and actionable insights.
      </p>

      <div className="mt-9 flex flex-wrap justify-center gap-4">
        <button
          type="button"
          onClick={() => setDemoOpen(true)}
          className="inline-flex h-14 items-center gap-3 rounded-xl bg-emerald-500 px-8 text-base font-black text-white shadow-lg shadow-emerald-950/20 hover:bg-emerald-400"
        >
          <Mail className="h-5 w-5" />
          Contact Sales
        </button>

        <button
          type="button"
          onClick={() => setDemoOpen(true)}
          className="inline-flex h-14 items-center gap-3 rounded-xl border border-emerald-400 px-8 text-base font-black text-emerald-100 hover:bg-emerald-500/10"
        >
          <CalendarDays className="h-5 w-5" />
          Book a Demo
        </button>
      </div>
    </div>
<div className="mt-14 flex flex-col items-center gap-4 text-sm font-bold text-emerald-100 md:items-start">
  <a href="tel:+255682751790" className="inline-flex items-center gap-3 hover:text-white">
    <span className="text-emerald-400">☎</span>
    +255 682 751 790
  </a>

  <a
    href="mailto:husseinmsuya898@gmail.com"
    className="inline-flex items-center gap-3 hover:text-white"
  >
    <Mail className="h-4 w-4 text-emerald-400" />
    husseinmsuya898@gmail.com
  </a>
</div>

    <div className="mt-8 border-t border-emerald-700/60 pt-8 text-center">
      <p className="text-base font-black italic text-emerald-300">
        Helping Businesses Keep Their Best Customers
      </p>
      <p className="mt-3 text-sm font-semibold text-emerald-700">
        © 2026 RetentionIQ. All rights reserved.
      </p>
    </div>
  </div>
</footer>
      </main>

      {demoOpen && (
        <DemoModal
          onClose={() => setDemoOpen(false)}
          isSignedIn={Boolean(isSignedIn)}
        />
      )}
    </>
  );
}