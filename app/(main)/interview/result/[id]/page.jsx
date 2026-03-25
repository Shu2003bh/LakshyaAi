import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

// ─── helpers ────────────────────────────────────────────────────────────────

function scoreBand(score) {
  if (score >= 8)  return { label: "Excellent",         color: "#22c55e",  bg: "rgba(34,197,94,0.08)",   border: "#14532d" };
  if (score >= 6)  return { label: "Good",              color: "#6366f1",  bg: "rgba(99,102,241,0.08)",  border: "#312e81" };
  if (score >= 4)  return { label: "Needs Improvement", color: "#f59e0b",  bg: "rgba(245,158,11,0.08)",  border: "#78350f" };
  return           { label: "Weak",                     color: "#ef4444",  bg: "rgba(239,68,68,0.08)",   border: "#7f1d1d" };
}

function overallBand(pct) {
  if (pct >= 80) return { label: "Placement Ready 🚀",   color: "#22c55e" };
  if (pct >= 60) return { label: "Interview Capable 💪", color: "#6366f1" };
  if (pct >= 40) return { label: "Needs Practice 📚",    color: "#f59e0b" };
  return         { label: "Keep Grinding 🔥",            color: "#ef4444" };
}

function ScoreArc({ value, max = 10 }) {
  const pct = value / max;
  const R = 38, C = 2 * Math.PI * R;
  const band = scoreBand(value);
  return (
    <svg width="90" height="90" viewBox="0 0 90 90">
      <circle cx="45" cy="45" r={R} fill="none" stroke="#1e1e24" strokeWidth="7" />
      <circle
        cx="45" cy="45" r={R}
        fill="none"
        stroke={band.color}
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={`${pct * C} ${C}`}
        transform="rotate(-90 45 45)"
      />
      <text x="45" y="49" textAnchor="middle" fontSize="14" fontWeight="700"
        fill={band.color} fontFamily="IBM Plex Mono, monospace">
        {value ?? 0}
      </text>
    </svg>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function InterviewResultPage(props) {
  const { id } = await props.params;

  const session = await db.interviewSession.findUnique({
    where: { id },
    include: {
      attempts: {
        include: { question: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!session) return notFound();

  // ── analytics ──────────────────────────────────────────────────────────────
  const attempted  = session.attempts.filter((a) => a.userAnswer);
  const skipped    = session.attempts.filter((a) => !a.userAnswer);
  const totalScore = session.totalScore ?? 0;
  const pct        = Math.round((totalScore / 10) * 100);
  const band       = overallBand(pct);

  // duration
  const dur =
    session.completedAt && session.startedAt
      ? Math.round(
          (new Date(session.completedAt) - new Date(session.startedAt)) / 1000
        )
      : null;
  const durFmt = dur
    ? `${Math.floor(dur / 60)}m ${dur % 60}s`
    : "—";

  // type-wise avg
  const byType = {};
  for (const a of attempted) {
    const t = a.question.type || "General";
    if (!byType[t]) byType[t] = [];
    byType[t].push(a.score ?? 0);
  }
  const typeAvg = Object.entries(byType).map(([t, arr]) => ({
    type: t,
    avg: (arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(1),
  }));

  return (
    <div
      className="min-h-screen bg-[#09090b] text-zinc-100 px-4 py-10"
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
    >
      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Sora:wght@400;600;700;800&display=swap');`}</style>

      <div className="max-w-3xl mx-auto space-y-8">

        {/* ── HEADER ───────────────────────────────────────── */}
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-zinc-600">Interview Complete</p>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Your Results
          </h1>
          <p className="text-zinc-500 text-sm">{session.role} · {session.attempts.length} Questions</p>
        </div>

        {/* ── SCORE HERO ───────────────────────────────────── */}
        <div
          className="rounded-2xl border p-8 flex flex-col md:flex-row items-center gap-8"
          style={{
            background: "linear-gradient(135deg, #111113, #0d0d12)",
            borderColor: "#1e1e24",
            boxShadow: "0 0 60px rgba(99,102,241,0.07)",
          }}
        >
          {/* Big score ring */}
          <div className="relative flex-shrink-0">
            {(() => {
              const R = 72, C = 2 * Math.PI * R;
              const p = pct / 100;
              return (
                <svg width="170" height="170" viewBox="0 0 170 170">
                  <circle cx="85" cy="85" r={R} fill="none" stroke="#1e1e24" strokeWidth="10" />
                  <circle
                    cx="85" cy="85" r={R}
                    fill="none"
                    stroke={band.color}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${p * C} ${C}`}
                    transform="rotate(-90 85 85)"
                    style={{ transition: "stroke-dasharray 1s ease" }}
                  />
                  <text x="85" y="78" textAnchor="middle" fontSize="36" fontWeight="800"
                    fill={band.color} fontFamily="Sora, sans-serif">
                    {pct}
                  </text>
                  <text x="85" y="98" textAnchor="middle" fontSize="11"
                    fill="#52525b" fontFamily="IBM Plex Mono, monospace">
                    out of 100
                  </text>
                </svg>
              );
            })()}
          </div>

          {/* Stats grid */}
          <div className="flex-1 space-y-4 w-full">
            <div>
              <p className="text-2xl font-bold" style={{ color: band.color, fontFamily: "'Sora', sans-serif" }}>
                {band.label}
              </p>
              <p className="text-zinc-500 text-sm mt-1">
                Avg score {totalScore.toFixed(1)}/10 across {attempted.length} answered questions
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Attempted", value: attempted.length, color: "#22c55e" },
                { label: "Skipped",   value: skipped.length,   color: "#f59e0b" },
                { label: "Duration",  value: durFmt,            color: "#6366f1" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl p-3 text-center"
                  style={{ background: "#0a0a0d", border: "1px solid #1e1e24" }}
                >
                  <p className="text-xs text-zinc-600 uppercase tracking-wider mb-1">{s.label}</p>
                  <p className="text-lg font-semibold" style={{ color: s.color, fontFamily: "'Sora'" }}>
                    {s.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Type-wise breakdown */}
            {typeAvg.length > 0 && (
              <div className="space-y-2">
                {typeAvg.map(({ type, avg }) => {
                  const w = Math.round((avg / 10) * 100);
                  return (
                    <div key={type} className="space-y-1">
                      <div className="flex justify-between text-xs text-zinc-500">
                        <span>{type}</span>
                        <span style={{ color: scoreBand(parseFloat(avg)).color }}>{avg}/10</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-zinc-800">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${w}%`,
                            background: scoreBand(parseFloat(avg)).color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── QUESTION BREAKDOWN ───────────────────────────── */}
        <div className="space-y-4">
          <h2
            className="text-lg font-semibold"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Question Breakdown
          </h2>

          {session.attempts.map((a, i) => {
            const answered = !!a.userAnswer;
            const band = answered ? scoreBand(a.score ?? 0) : null;

            return (
              <div
                key={a.id}
                className="rounded-2xl border p-5 space-y-4"
                style={{
                  background: answered ? band.bg : "rgba(39,39,42,0.4)",
                  borderColor: answered ? band.border : "#27272a",
                }}
              >
                {/* Question header */}
                <div className="flex items-start gap-4">
                  {answered && <ScoreArc value={a.score ?? 0} />}

                  {!answered && (
                    <div
                      className="w-[90px] h-[90px] rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: "#1e1e24" }}
                    >
                      ⟳
                    </div>
                  )}

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-zinc-600">Q{i + 1}</span>
                      {a.question.difficulty && (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full border"
                          style={scoreBand(
                            a.question.difficulty === "Hard" ? 2 :
                            a.question.difficulty === "Medium" ? 5 : 8
                          )}
                        >
                          {a.question.difficulty}
                        </span>
                      )}
                      {a.question.type && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-zinc-800 text-zinc-500">
                          {a.question.type}
                        </span>
                      )}
                      {!answered && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-yellow-900 text-yellow-600">
                          Skipped
                        </span>
                      )}
                    </div>

                    <p
                      className="text-sm text-zinc-200 leading-relaxed"
                      style={{ fontFamily: "'Sora', sans-serif" }}
                    >
                      {a.question.question}
                    </p>

                    {answered && (
                      <p
                        className="text-sm font-semibold"
                        style={{ color: band.color }}
                      >
                        {band.label}
                      </p>
                    )}
                  </div>
                </div>

                {/* Answer + Feedback */}
                {answered && (
                  <div className="grid md:grid-cols-2 gap-3">
                    <div
                      className="rounded-xl p-4 space-y-1"
                      style={{ background: "#0a0a0d", border: "1px solid #1e1e24" }}
                    >
                      <p className="text-[10px] uppercase tracking-widest text-zinc-600">Your Answer</p>
                      <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                        {a.userAnswer}
                      </p>
                    </div>

                    <div
                      className="rounded-xl p-4 space-y-1"
                      style={{ background: "#0a0a0d", border: "1px solid #1e1e24" }}
                    >
                      <p className="text-[10px] uppercase tracking-widest text-zinc-600">AI Feedback</p>
                      <p className="text-sm text-zinc-300 leading-relaxed">
                        {a.feedback || "No feedback available."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── CTA ──────────────────────────────────────────── */}
        <div className="flex gap-3 pb-8">
          <Link
            href="/interview"
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-center transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff",
              boxShadow: "0 4px 20px rgba(99,102,241,0.3)",
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            Practice Again →
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-xl text-sm text-zinc-400 border border-zinc-800 hover:border-zinc-600 hover:text-zinc-200 transition-all duration-200"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            Dashboard
          </Link>
        </div>

      </div>
    </div>
  );
}