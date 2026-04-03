import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

/* ─── helpers ─── */
function overallBand(pct) {
  if (pct >= 80) return { label: "Excellent Performance 🚀", color: "#22c55e", bg: "#f0fdf4" };
  if (pct >= 60) return { label: "Good Performance 💪", color: "#6366f1", bg: "#eef2ff" };
  if (pct >= 40) return { label: "Needs Improvement 📚", color: "#f59e0b", bg: "#fffbeb" };
  return { label: "Keep Practicing 🔥", color: "#ef4444", bg: "#fef2f2" };
}

/* ─── Score Ring ─── */
function ScoreRing({ pct, size = 160, strokeWidth = 10, color }) {
  const R = (size - strokeWidth) / 2;
  const C = 2 * Math.PI * R;
  const dash = (pct / 100) * C;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={R}
        fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${C}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dasharray 1s ease" }}
      />
      <text x={size / 2} y={size / 2 - 6} textAnchor="middle" fontSize="32" fontWeight="800" fill={color}>
        {pct}%
      </text>
      <text x={size / 2} y={size / 2 + 14} textAnchor="middle" fontSize="11" fill="#94a3b8">
        Score
      </text>
    </svg>
  );
}

/* ─── Page ─── */
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

  const totalScore = session.totalScore ?? 0;
  const correct = session.attempts.filter((a) => a.isCorrect).length;
  const wrong = session.attempts.filter((a) => a.userAnswer && !a.isCorrect).length;
  const skipped = session.attempts.filter((a) => !a.userAnswer).length;
  const total = session.attempts.length;
  const band = overallBand(totalScore);

  const dur = session.completedAt && session.startedAt
    ? Math.round((new Date(session.completedAt) - new Date(session.startedAt)) / 1000)
    : null;
  const durFmt = dur ? `${Math.floor(dur / 60)}m ${dur % 60}s` : "—";

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center pt-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
            Interview Complete
          </p>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Your Results
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {session.role} · {total} Questions
          </p>
        </div>

        {/* Score Hero */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col md:flex-row items-center gap-8">
          <ScoreRing pct={totalScore} color={band.color} />

          <div className="flex-1 space-y-4 w-full">
            <div>
              <p className="text-xl font-bold" style={{ color: band.color }}>
                {band.label}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                {correct} out of {total} questions answered correctly
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Correct", value: correct, color: "#22c55e", bg: "#f0fdf4" },
                { label: "Wrong", value: wrong, color: "#ef4444", bg: "#fef2f2" },
                { label: "Skipped", value: skipped, color: "#f59e0b", bg: "#fffbeb" },
                { label: "Duration", value: durFmt, color: "#6366f1", bg: "#eef2ff" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl p-3 text-center border" style={{ background: s.bg, borderColor: s.color + "30" }}>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
                  <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Question Breakdown */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-700 px-1">
            Question Breakdown
          </h2>

          {session.attempts.map((a, i) => {
            const answered = !!a.userAnswer;
            const wasCorrect = a.isCorrect;

            return (
              <div
                key={a.id}
                className={`bg-white rounded-2xl border shadow-sm p-5 ${
                  !answered ? "border-amber-200" :
                  wasCorrect ? "border-emerald-200" : "border-red-200"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Status icon */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold ${
                    !answered ? "bg-amber-50 text-amber-500" :
                    wasCorrect ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                  }`}>
                    {!answered ? "—" : wasCorrect ? "✓" : "✗"}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Question */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs text-slate-400">Q{i + 1}</span>
                      {a.question.difficulty && (
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          a.question.difficulty === "Hard" ? "bg-red-50 text-red-500" :
                          a.question.difficulty === "Medium" ? "bg-amber-50 text-amber-600" :
                          "bg-emerald-50 text-emerald-600"
                        }`}>
                          {a.question.difficulty}
                        </span>
                      )}
                      {a.question.category && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-50 text-slate-400">
                          {a.question.category}
                        </span>
                      )}
                      {!answered && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-500">
                          Skipped
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-700 leading-relaxed mb-3">
                      {a.question.question}
                    </p>

                    {/* Answer details */}
                    {answered && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className={`rounded-xl p-3 border ${wasCorrect ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}`}>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Your Answer</p>
                          <p className={`text-sm font-medium ${wasCorrect ? "text-emerald-700" : "text-red-700"}`}>
                            {a.userAnswer}
                          </p>
                        </div>
                        {!wasCorrect && (
                          <div className="rounded-xl p-3 border bg-emerald-50 border-emerald-100">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Correct Answer</p>
                            <p className="text-sm font-medium text-emerald-700">
                              {a.question.correctAnswer}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Explanation */}
                    {a.question.explanation && (
                      <div className="mt-2 p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                        <p className="text-[10px] text-indigo-400 uppercase tracking-wider mb-0.5">Explanation</p>
                        <p className="text-xs text-indigo-600 leading-relaxed">
                          {a.question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTAs */}
        <div className="flex gap-3 pb-8">
          <Link
            href="/interview"
            className="flex-1 py-3.5 rounded-xl text-sm font-semibold text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-200 hover:shadow-lg transition-all"
          >
            Practice Again →
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3.5 rounded-xl text-sm font-medium text-slate-500 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}