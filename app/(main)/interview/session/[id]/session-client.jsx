"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { submitAnswer, finishInterview } from "@/actions/interview";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle2, XCircle, ChevronRight, ArrowRight, AlertTriangle, Lightbulb, Flag } from "lucide-react";
import { toast } from "sonner";

/* ─── helpers ─── */
function fmt(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/* ─── Option Labels ─── */
const OPTION_LABELS = ["A", "B", "C", "D"];

/* ─── Main Component ─── */
export default function SessionClient({ session }) {
  const router = useRouter();

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [loading, setLoading] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [remaining, setRemaining] = useState(null);
  const [results, setResults] = useState([]); // Track all answers
  const timerRef = useRef(null);

  const total = session.attempts.length;
  const q = session.attempts[index].question;
  const isLast = index === total - 1;

  /* ─── Timer ─── */
  useEffect(() => {
    if (!session.endsAt) return;

    const tick = () => {
      const end = new Date(session.endsAt).getTime();
      const sec = Math.max(0, Math.floor((end - Date.now()) / 1000));
      setRemaining(sec);
      if (sec <= 0) {
        clearInterval(timerRef.current);
        handleFinish();
      }
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, []); // eslint-disable-line

  /* ─── Submit answer ─── */
  const handleSubmitAnswer = async () => {
    if (!selected || loading) return;
    setLoading(true);

    try {
      const attempt = session.attempts[index];
      await submitAnswer(attempt.id, selected);

      const correct = selected === q.correctAnswer;
      setIsCorrect(correct);
      setSubmitted(true);
      setResults((prev) => [...prev, { index, selected, correct, question: q }]);
    } catch (err) {
      toast.error("Failed to submit answer");
    } finally {
      setLoading(false);
    }
  };

  /* ─── Next question ─── */
  const handleNext = () => {
    if (isLast) {
      handleFinish();
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setSubmitted(false);
    setIsCorrect(null);
  };

  /* ─── Finish ─── */
  const handleFinish = async () => {
    if (finishing) return;
    setFinishing(true);
    clearInterval(timerRef.current);
    try {
      await finishInterview(session.id);
      toast.success("Interview completed! Check your results.");
      router.push(`/interview/result/${session.id}`);
    } catch {
      toast.error("Failed to finish interview");
    }
  };

  /* ─── Timer color ─── */
  const urgent = remaining !== null && remaining < 120;
  const warning = remaining !== null && remaining < 300;
  const timerColor = urgent ? "#ef4444" : warning ? "#f59e0b" : "#6366f1";

  /* ─── Options with correct labels ─── */
  const options = q.options || [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {session.role}
            </span>
            <span className="text-xs text-slate-300">·</span>
            <span className="text-xs text-slate-400">
              Question {index + 1} of {total}
            </span>
          </div>

          {remaining !== null && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border" style={{
              borderColor: timerColor + "40",
              background: timerColor + "08",
            }}>
              <Clock size={13} style={{ color: timerColor }} />
              <span className="text-sm font-mono font-bold tabular-nums" style={{ color: timerColor }}>
                {fmt(remaining)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-slate-100">
        <motion.div
          className="h-full bg-indigo-500 rounded-r-full"
          initial={{ width: 0 }}
          animate={{ width: `${((index + 1) / total) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-3xl space-y-5">

          {/* Question Dots */}
          <div className="flex justify-center gap-1.5">
            {session.attempts.map((_, i) => {
              const result = results.find((r) => r.index === i);
              const isCurrent = i === index;
              let bg = "#e2e8f0";
              if (result) bg = result.correct ? "#22c55e" : "#ef4444";
              if (isCurrent) bg = "#6366f1";
              return (
                <div
                  key={i}
                  className="rounded-full transition-all duration-200"
                  style={{
                    width: isCurrent ? 24 : 8,
                    height: 8,
                    background: bg,
                    borderRadius: isCurrent ? 4 : "50%",
                  }}
                />
              );
            })}
          </div>

          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              {/* Question Header */}
              <div className="px-6 py-5 border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-indigo-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-base font-medium text-slate-800 leading-relaxed">
                      {q.question}
                    </p>
                    {q.difficulty && (
                      <span className={`inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        q.difficulty === "Hard" ? "bg-red-50 text-red-600" :
                        q.difficulty === "Medium" ? "bg-amber-50 text-amber-600" :
                        "bg-emerald-50 text-emerald-600"
                      }`}>
                        {q.difficulty}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="px-6 py-5 space-y-2.5">
                {options.map((opt, i) => {
                  const optLabel = typeof opt === "string" && opt.match(/^[A-D]\.?\s/) ? opt : `${OPTION_LABELS[i]}. ${opt}`;
                  const optValue = typeof opt === "string" && opt.match(/^[A-D]\.?\s/) ? opt.charAt(0) : OPTION_LABELS[i];
                  const isSelected = selected === optValue;

                  let borderColor = "#e2e8f0";
                  let bgColor = "transparent";
                  let textColor = "#475569";

                  if (submitted) {
                    if (optValue === q.correctAnswer) {
                      borderColor = "#22c55e";
                      bgColor = "#f0fdf4";
                      textColor = "#166534";
                    } else if (isSelected && !isCorrect) {
                      borderColor = "#ef4444";
                      bgColor = "#fef2f2";
                      textColor = "#991b1b";
                    }
                  } else if (isSelected) {
                    borderColor = "#6366f1";
                    bgColor = "#eef2ff";
                    textColor = "#3730a3";
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => !submitted && setSelected(optValue)}
                      disabled={submitted}
                      className="w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-150 disabled:cursor-default"
                      style={{ borderColor, background: bgColor }}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{
                          background: isSelected && !submitted ? "#6366f1" : submitted && optValue === q.correctAnswer ? "#22c55e" : submitted && isSelected ? "#ef4444" : "#f1f5f9",
                          color: (isSelected && !submitted) || (submitted && (optValue === q.correctAnswer || isSelected)) ? "#fff" : "#94a3b8",
                        }}
                      >
                        {optValue}
                      </div>
                      <span className="text-sm font-medium flex-1" style={{ color: textColor }}>
                        {typeof opt === "string" && opt.match(/^[A-D]\.?\s/) ? opt.slice(2).trim() : opt}
                      </span>
                      {submitted && optValue === q.correctAnswer && (
                        <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                      )}
                      {submitted && isSelected && !isCorrect && optValue !== q.correctAnswer && (
                        <XCircle size={18} className="text-red-500 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation (shown after submit) */}
              <AnimatePresence>
                {submitted && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className={`mx-6 mb-5 p-4 rounded-xl border ${
                      isCorrect ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {isCorrect ? (
                          <CheckCircle2 size={16} className="text-emerald-600" />
                        ) : (
                          <Lightbulb size={16} className="text-amber-600" />
                        )}
                        <span className={`text-sm font-semibold ${isCorrect ? "text-emerald-700" : "text-amber-700"}`}>
                          {isCorrect ? "Correct!" : "Incorrect"}
                        </span>
                      </div>
                      {q.explanation && (
                        <p className={`text-xs leading-relaxed ${isCorrect ? "text-emerald-600" : "text-amber-600"}`}>
                          {q.explanation}
                        </p>
                      )}
                      {!isCorrect && (
                        <p className="text-xs text-amber-600 mt-1">
                          Correct answer: <span className="font-semibold">{q.correctAnswer}</span>
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Bar */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
                {!submitted ? (
                  <>
                    <button
                      onClick={handleFinish}
                      disabled={finishing}
                      className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 border border-slate-200 hover:border-slate-300 hover:text-slate-500 transition-colors"
                    >
                      <Flag size={12} className="inline mr-1" />
                      End Early
                    </button>
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={!selected || loading}
                      className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 active:scale-[0.97] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          Submit
                          <CheckCircle2 size={14} />
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleNext}
                    className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 active:scale-[0.97] transition-all"
                  >
                    {isLast ? "See Results" : "Next Question"}
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Urgent Warning */}
          {urgent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm"
            >
              <AlertTriangle size={14} />
              <span className="font-medium">Less than 2 minutes remaining!</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom Status */}
      <div className="bg-white border-t border-slate-200 px-6 py-3">
        <div className="max-w-3xl mx-auto flex justify-between text-[11px] text-slate-400">
          <span>✓ {results.filter((r) => r.correct).length} correct</span>
          <span>✗ {results.filter((r) => !r.correct).length} wrong</span>
          <span>◎ {total - results.length} remaining</span>
        </div>
      </div>
    </div>
  );
}