"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import {
  ArrowRight,
  BadgeDollarSign,
  Bell,
  BrainCircuit,
  Database,
  Home,
  Loader2,
  MessageSquareText,
  Search,
  Send,
  Settings,
  Sparkles,
  Users,
  WandSparkles
} from "lucide-react";

const questions = [
  "How many customers are there now?",
  "How much revenue is at risk?",
  "Which segment has the highest churn risk?",
  "Why are customers leaving?",
  "What retention actions should we take?",
  "Which customers should managers call first?"
];

const sidebar = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Predictions", href: "/predictions", icon: BrainCircuit },
  { label: "Revenue", href: "/revenue", icon: BadgeDollarSign },
  { label: "AI Insights", href: "/insights", icon: MessageSquareText },
  { label: "Recommendations", href: "/recommendations", icon: WandSparkles },
  { label: "Settings", href: "/settings", icon: Settings }
];

export default function InsightsPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function askAI(input?: string) {
    const prompt = input || question;

    if (!prompt.trim()) return;

    setQuestion(prompt);
    setLoading(true);
    setAnswer("");

    try {
      const res = await fetch(`${API_BASE}/ai/insights`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question: prompt
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setAnswer(
          data.detail ||
            data.answer ||
            data.message ||
            "AI request failed. Please check your backend terminal."
        );
        return;
      }

      setAnswer(
        data.answer ||
          data.message ||
          "RetentionIQ AI is ready, but no answer was returned."
      );
    } catch {
      setAnswer(
       "Backend AI endpoint is not reachable. Check NEXT_PUBLIC_API_URL and make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
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
              <p className="text-xs text-slate-500">AI Workspace</p>
            </div>
          </div>

          <nav className="mt-8 space-y-1">
            {sidebar.map((item) => {
              const Icon = item.icon;
              const active = item.href === "/insights";

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
                <p className="text-sm text-slate-500">AI Business Insights</p>
                <h2 className="font-black">Ask RetentionIQ AI</h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden h-10 w-80 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-slate-500 md:flex">
                  <Search className="h-4 w-4" />
                  Search insights...
                </div>

                <button className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-300">
                  <Bell className="h-4 w-4" />
                </button>

                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </header>

          <div className="px-5 py-8 lg:px-8">
            <div className="mb-8">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-400">
                Groq AI Assistant
              </p>
              <h1 className="mt-2 text-4xl font-black">
                Ask why churn is happening
              </h1>
              <p className="mt-2 max-w-3xl text-slate-400">
                Ask questions about churn risk, customer segments, revenue exposure, and retention actions.
              </p>
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <section className="rounded-xl border border-white/10 bg-white/[0.06] p-6">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-lg bg-blue-500/15 text-blue-300">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black">Suggested Questions</h3>
                    <p className="text-sm text-slate-400">
                      Click one to ask AI using Neon data.
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {questions.map((q) => (
                    <button
                      key={q}
                      onClick={() => askAI(q)}
                      className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-black/30 p-4 text-left text-sm font-semibold text-slate-300 transition hover:border-blue-400/50 hover:bg-blue-500/10"
                    >
                      {q}
                      <ArrowRight className="h-4 w-4 text-blue-300" />
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-white/10 bg-white/[0.06] p-6">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-lg bg-emerald-500/15 text-emerald-300">
                    <MessageSquareText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black">AI Chat</h3>
                    <p className="text-sm text-slate-400">
                      Ask a custom question from saved prediction data.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") askAI();
                    }}
                    placeholder="Ask about churn, segments, revenue, or recommendations..."
                    className="h-12 min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400"
                  />

                  <button
                    onClick={() => askAI()}
                    disabled={loading}
                    className="inline-flex h-12 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-bold transition hover:bg-blue-500 disabled:opacity-60"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Ask
                  </button>
                </div>

                <div className="mt-6 min-h-[280px] rounded-xl border border-white/10 bg-black/30 p-5">
                  {loading ? (
                    <div className="flex h-56 items-center justify-center text-slate-400">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Reading Neon data and thinking with Groq...
                    </div>
                  ) : answer ? (
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">
                        AI Answer
                      </p>
                      <p className="mt-4 whitespace-pre-line leading-7 text-slate-200">
                        {answer}
                      </p>
                    </div>
                  ) : (
                    <div className="flex h-56 flex-col items-center justify-center text-center">
                      <Database className="h-10 w-10 text-slate-600" />
                      <p className="mt-3 font-bold text-slate-300">
                        No question asked yet
                      </p>
                      <p className="mt-1 max-w-md text-sm text-slate-500">
                        Ask a question above. RetentionIQ AI will use prediction data saved in Neon PostgreSQL.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
