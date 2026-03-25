"use client";

import { useState, useEffect, useRef } from "react";
import { evaluateAnswer, finishInterview } from "@/actions/interview";
import { useRouter } from "next/navigation";

// ─── tiny helpers ────────────────────────────────────────────────────────────
function fmt(sec) {
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

const TOTAL = 1200; // 20 min

// ─── Circular Timer SVG ──────────────────────────────────────────────────────
function CircleTimer({ remaining, total }) {
  const R = 54;
  const C = 2 * Math.PI * R;
  const pct = remaining / total;
  const dash = pct * C;
  const urgent = remaining < 120;
  const warning = remaining < 300;

  const color = urgent ? "#ef4444" : warning ? "#f59e0b" : "#6366f1";

  return (
    <svg width="140" height="140" className="rotate-[-90deg]">
      {/* track */}
      <circle
        cx="70" cy="70" r={R}
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        className="text-zinc-800"
      />
      {/* progress */}
      <circle
        cx="70" cy="70" r={R}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${C}`}
        style={{ transition: "stroke-dasharray 1s linear, stroke 0.5s" }}
      />
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function InterviewSessionClient({ session }) {
  const router = useRouter();

  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [remaining, setRemaining] = useState(TOTAL);
  const [loading, setLoading] = useState(false);
  const [skipped, setSkipped] = useState([]); // indices skipped
  const [submitted, setSubmitted] = useState([]); // indices already submitted
  const [finishing, setFinishing] = useState(false);
  const timerRef = useRef(null);
  const textRef = useRef(null);

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      const end = new Date(session.endsAt).getTime();
      const sec = Math.max(0, Math.floor((end - Date.now()) / 1000));
      setRemaining(sec);
      if (sec === 0) doFinish();
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // auto-focus textarea on question change
  useEffect(() => {
    textRef.current?.focus();
  }, [index]);

  const attempt = session.attempts[index];
  const total = session.attempts.length;
  const isLast = index === total - 1;
  const urgent = remaining < 120;
  const warning = remaining < 300;

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!answer.trim() || loading) return;
    setLoading(true);
    try {
      await evaluateAnswer(attempt.id, answer);
      setSubmitted((p) => [...p, index]);
      setAnswer("");
      if (isLast) {
        doFinish();
      } else {
        setIndex((i) => i + 1);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Skip ───────────────────────────────────────────────────────────────────
  const handleSkip = () => {
    if (isLast) {
      doFinish();
      return;
    }
    setSkipped((p) => [...p, index]);
    setAnswer("");
    setIndex((i) => i + 1);
  };

  // ── Finish ─────────────────────────────────────────────────────────────────
  const doFinish = async () => {
    if (finishing) return;
    setFinishing(true);
    clearInterval(timerRef.current);
    await finishInterview(session.id);
    router.push(`/interview/result/${session.id}`);
  };

  // ─── JSX ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-['IBM_Plex_Mono',monospace] px-4 py-8">

      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Sora:wght@400;600;700&display=swap');`}</style>

      <div className="max-w-3xl mx-auto space-y-6">

        {/* ── TOP BAR ─────────────────────────────────────── */}
        <div className="flex items-center justify-between">

          {/* Role badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-zinc-500">Role</span>
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold border"
              style={{ borderColor: "#6366f1", color: "#818cf8" }}
            >
              {session.role}
            </span>
          </div>

          {/* Question dots */}
          <div className="flex gap-1.5">
            {session.attempts.map((_, i) => {
              const isSubmittedDot = submitted.includes(i);
              const isSkippedDot = skipped.includes(i);
              const isCurrent = i === index;
              return (
                <div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                  style={{
                    background: isCurrent
                      ? "#6366f1"
                      : isSubmittedDot
                      ? "#22c55e"
                      : isSkippedDot
                      ? "#f59e0b"
                      : "#27272a",
                    transform: isCurrent ? "scale(1.4)" : "scale(1)",
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* ── MAIN CARD ───────────────────────────────────── */}
        <div
          className="rounded-2xl border p-6 space-y-6"
          style={{
            borderColor: urgent ? "#7f1d1d" : warning ? "#78350f" : "#27272a",
            background: urgent
              ? "rgba(127,29,29,0.08)"
              : warning
              ? "rgba(120,53,15,0.06)"
              : "#111113",
            boxShadow: urgent
              ? "0 0 40px rgba(239,68,68,0.08)"
              : "0 0 40px rgba(99,102,241,0.05)",
          }}
        >

          {/* ── TIMER + QUESTION NUMBER ─── */}
          <div className="flex items-center gap-6">

            {/* Timer circle */}
            <div className="relative flex-shrink-0">
              <CircleTimer remaining={remaining} total={TOTAL} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="text-xl font-semibold tabular-nums"
                  style={{ color: urgent ? "#ef4444" : warning ? "#f59e0b" : "#a5b4fc" }}
                >
                  {fmt(remaining)}
                </span>
                <span className="text-[10px] text-zinc-600 uppercase tracking-wider">left</span>
              </div>
            </div>

            {/* Question header */}
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-zinc-500 uppercase tracking-widest">
                  Question
                </span>
                <span className="text-lg font-bold text-zinc-200 font-['Sora']">
                  {index + 1}
                  <span className="text-zinc-600 font-normal text-base"> / {total}</span>
                </span>
              </div>

              {/* Tags */}
              <div className="flex gap-2 flex-wrap">
                {attempt.question.difficulty && (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full border"
                    style={{
                      borderColor:
                        attempt.question.difficulty === "Hard"
                          ? "#7f1d1d"
                          : attempt.question.difficulty === "Medium"
                          ? "#78350f"
                          : "#14532d",
                      color:
                        attempt.question.difficulty === "Hard"
                          ? "#fca5a5"
                          : attempt.question.difficulty === "Medium"
                          ? "#fcd34d"
                          : "#86efac",
                    }}
                  >
                    {attempt.question.difficulty}
                  </span>
                )}
                {attempt.question.type && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-zinc-700 text-zinc-400">
                    {attempt.question.type}
                  </span>
                )}
                {attempt.question.company && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-indigo-900 text-indigo-400">
                    {attempt.question.company}
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div className="h-1 rounded-full bg-zinc-800 mt-2">
                <div
                  className="h-1 rounded-full transition-all duration-500"
                  style={{
                    width: `${((index + 1) / total) * 100}%`,
                    background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* ── QUESTION TEXT ─── */}
          <div
            className="rounded-xl p-5 leading-relaxed text-zinc-200 text-base font-['Sora'] tracking-wide"
            style={{
              background: "#0d0d10",
              border: "1px solid #1e1e24",
              lineHeight: "1.75",
            }}
          >
            {attempt.question.question}
          </div>

          {/* ── ANSWER TEXTAREA ─── */}
          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-widest text-zinc-500">
              Your Answer
            </label>
            <textarea
              ref={textRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) handleSubmit();
              }}
              placeholder="Type your answer here… (Ctrl+Enter to submit)"
              rows={6}
              className="w-full resize-none rounded-xl p-4 text-sm text-zinc-200 placeholder-zinc-700 outline-none transition-all duration-200"
              style={{
                background: "#0a0a0d",
                border: "1.5px solid",
                borderColor: answer.trim() ? "#6366f1" : "#1e1e24",
                fontFamily: "IBM Plex Mono, monospace",
              }}
            />
            <div className="flex justify-between text-[10px] text-zinc-700">
              <span>{answer.length} chars</span>
              <span>Ctrl+Enter to submit</span>
            </div>
          </div>

          {/* ── ACTIONS ─── */}
          <div className="flex items-center gap-3 pt-1">

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading || !answer.trim() || finishing}
              className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: answer.trim()
                  ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                  : "#27272a",
                color: "#fff",
                boxShadow: answer.trim() ? "0 4px 20px rgba(99,102,241,0.3)" : "none",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner />
                  Evaluating…
                </span>
              ) : isLast ? (
                "Submit & Finish"
              ) : (
                "Submit & Next →"
              )}
            </button>

            {/* Skip */}
            {!isLast && (
              <button
                onClick={handleSkip}
                disabled={loading || finishing}
                className="px-5 py-3 rounded-xl text-sm text-zinc-400 border border-zinc-800 hover:border-zinc-600 hover:text-zinc-200 transition-all duration-200 disabled:opacity-40"
              >
                Skip
              </button>
            )}

            {/* End early */}
            <button
              onClick={doFinish}
              disabled={finishing}
              className="px-4 py-3 rounded-xl text-xs text-zinc-600 hover:text-red-400 border border-transparent hover:border-red-900 transition-all duration-200 disabled:opacity-40"
            >
              End
            </button>
          </div>

        </div>

        {/* ── BOTTOM STATUS ───────────────────────────────── */}
        <div className="flex justify-between text-[11px] text-zinc-600 px-1">
          <span>✓ {submitted.length} submitted</span>
          <span>⟳ {skipped.length} skipped</span>
          <span>◎ {total - submitted.length - skipped.length} remaining</span>
        </div>

        {/* Urgent warning */}
        {urgent && (
          <div
            className="rounded-xl px-4 py-3 text-sm text-center animate-pulse"
            style={{ background: "rgba(239,68,68,0.1)", color: "#fca5a5", border: "1px solid #7f1d1d" }}
          >
            ⚠️ Less than 2 minutes! Wrap up quickly.
          </div>
        )}

      </div>
    </div>
  );
}

// ── Micro spinner ─────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}