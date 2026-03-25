"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, Square, Clock, AlertCircle } from "lucide-react"

import {
  createSession, isSessionOver,
  updateSessionAfterAnswer, completeSession
} from "@/lib/interview/engine/sessionEngine"
import { generateNextQuestion } from "@/lib/interview/engine/questionEngine"
import { speechEngine } from "@/lib/interview/voice/speechEngine"
import { RecorderEngine } from "@/lib/interview/voice/recorderEngine"

// ─── States ───────────────────────────────────────────────────────────────
const S = {
  INIT: "init", ASKING: "asking", COUNTDOWN: "countdown",
  RECORDING: "recording", PROCESSING: "processing",
  COMPLETED: "completed", ERROR: "error",
}

// ⭐ Fix 1: Correct question counts per duration
// const Q_COUNT = { quick: 3, standard: 6, focus: 9, deep: 12 }
const DUR_MAP = {
  "5": "quick", "10": "standard", "15": "focus", "20": "deep",
  quick: "quick", standard: "standard", focus: "focus", deep: "deep"
}

function extractJSON(raw) {
  if (!raw) return null
  const s = raw.replace(/```json|```/gi, "").trim()
  let st = -1, d = 0, en = -1
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "{") { if (st === -1) st = i; d++ }
    else if (s[i] === "}") { if (--d === 0 && st !== -1) { en = i; break } }
  }
  if (st === -1 || en === -1) return null
  try { return JSON.parse(s.slice(st, en + 1)) } catch { return null }
}

function fmt(s) { return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}` }

function AIAvatar({ state }) {
  const speaking = state === S.ASKING
  const recording = state === S.RECORDING
  const busy = state === S.PROCESSING
  return (
    <div className="relative flex items-center justify-center w-28 h-28">
      {speaking && [1, 2, 3].map(i => (
        <motion.div key={i} className="absolute rounded-full border border-indigo-400"
          initial={{ width: 112, height: 112, opacity: .6 }}
          animate={{ width: 112 + i * 28, height: 112 + i * 28, opacity: 0 }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * .4, ease: "easeOut" }} />
      ))}
      {recording && [1, 2].map(i => (
        <motion.div key={i} className="absolute rounded-full border border-red-400"
          initial={{ width: 112, height: 112, opacity: .5 }}
          animate={{ width: 112 + i * 20, height: 112 + i * 20, opacity: 0 }}
          transition={{ duration: 1, repeat: Infinity, delay: i * .3, ease: "easeOut" }} />
      ))}
      <div className={`w-28 h-28 rounded-full flex items-center justify-center shadow-lg transition-all duration-500
        ${recording ? "bg-gradient-to-br from-red-500 to-red-700 shadow-red-200"
          : "bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-indigo-200"}`}>
        {busy ? (
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <motion.div key={i} className="w-2 h-2 bg-white rounded-full"
                animate={{ y: [0, -6, 0] }} transition={{ duration: .6, repeat: Infinity, delay: i * .15 }} />
            ))}
          </div>
        ) : recording ? <Mic size={28} className="text-white" />
          : <span className="text-white font-bold text-xl">AI</span>}
      </div>
    </div>
  )
}

function ProgressBar({ current, total }) {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0
  return (
    <div className="flex items-center gap-3 w-full">
      <span className="text-xs text-slate-400 font-medium w-14">Q {current}/{total}</span>
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div className="h-full bg-indigo-500 rounded-full"
          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: .4 }} />
      </div>
      <span className="text-xs text-slate-400 font-medium w-8 text-right">{pct}%</span>
    </div>
  )
}

function ReportView({ report, config, onRestart }) {
  const score = Number(report?.averageScore) || 0
  const color = score >= 8 ? "#22c55e" : score >= 5 ? "#f59e0b" : "#ef4444"
  const label = score >= 8 ? "Excellent" : score >= 5 ? "Good" : "Needs Work"
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg mx-auto space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-3">Interview Complete</p>
        <div className="text-7xl font-bold mb-1" style={{ color }}>{score.toFixed(1)}</div>
        <div className="text-sm font-semibold text-slate-500">{label}</div>
        <div className="text-xs text-slate-400 mt-1 capitalize">
          {config?.role?.replace(/_/g, " ")} · {config?.mode} · {config?.duration} min
        </div>
      </div>
      {report?.scores?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Question Breakdown</p>
          {report.scores.map((s, i) => {
            const c = s.score >= 8 ? "#22c55e" : s.score >= 5 ? "#f59e0b" : "#ef4444"
            return (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-20 truncate">{s.skill}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(s.score / 10) * 100}%`, background: c }} />
                </div>
                <span className="text-xs font-semibold w-8 text-right" style={{ color: c }}>{s.score}/10</span>
              </div>
            )
          })}
        </div>
      )}
      {report?.feedback && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">AI Feedback</p>
          <p className="text-sm text-slate-600 leading-relaxed">{report.feedback}</p>
        </div>
      )}
      {report?.strongAreas?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">Strong Areas</p>
          <div className="flex flex-wrap gap-2">
            {report.strongAreas.map(a => (
              <span key={a} className="px-2 py-0.5 rounded-full text-xs bg-green-50 text-green-700 border border-green-200">{a}</span>
            ))}
          </div>
        </div>
      )}
      {report?.weakAreas?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2">Focus Areas</p>
          <div className="flex flex-wrap gap-2">
            {report.weakAreas.map(a => (
              <span key={a} className="px-2 py-0.5 rounded-full text-xs bg-red-50 text-red-700 border border-red-200">{a}</span>
            ))}
          </div>
        </div>
      )}
      <button onClick={onRestart}
        className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 active:scale-[0.98] transition-all">
        Start New Interview
      </button>
    </motion.div>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────
export default function VoiceInterviewSessionPage() {
  const params = useSearchParams()
  const router = useRouter()

  const config = (() => {
    try { const r = params.get("config"); if (r) return JSON.parse(decodeURIComponent(r)) } catch { }
    return { role: "frontend_developer", mode: "fresher", duration: 10, voice: "indian" }
  })()

  const durationKey = DUR_MAP[String(config.duration)] || DUR_MAP[config.durationKey] || "standard"
  // const totalQ = Q_COUNT[durationKey] || 6  // ⭐ correct count
  const totalQ = 999

  const [uiState, setUiState] = useState(S.INIT)
  const [currentQ, setCurrentQ] = useState(null)
  const [countdown, setCountdown] = useState(10)
  const [recordTime, setRecordTime] = useState(0)
  const [timeLeft, setTimeLeft] = useState((config.duration || 10) * 60)
  const [finalReport, setFinalReport] = useState(null)
  const [transcript, setTranscript] = useState("")
  const [qCount, setQCount] = useState(0)

  const sessionRef = useRef(null)
  const currentQRef = useRef(null)
  const recorderRef = useRef(null)
  const clockRef = useRef(null)
  const countdownRef = useRef(null)
  const recordTimerRef = useRef(null)
  const recordSecRef = useRef(0)
  const qCountRef = useRef(0)

  useEffect(() => {
    const s = createSession({ roleKey: config.role || "frontend_developer", modeKey: config.mode || "fresher", durationKey })
    sessionRef.current = s
    recorderRef.current = new RecorderEngine()
    speechEngine.unlock()
    clockRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { clearInterval(clockRef.current); endSession(); return 0 } return t - 1 })
    }, 1000)
    loadNext(s)
    return () => {
      clearInterval(clockRef.current)
      clearInterval(countdownRef.current)
      clearInterval(recordTimerRef.current)
      speechEngine.cancel()
    }
  }, []) // eslint-disable-line

  // ⭐ Fix 2: 10s countdown → auto-start recording
  useEffect(() => {
    if (uiState !== S.COUNTDOWN) return
    setCountdown(10)
    countdownRef.current = setInterval(() => {
      setCountdown(v => {
        if (v <= 1) { clearInterval(countdownRef.current); startRecording(); return 0 }
        return v - 1
      })
    }, 1000)
    return () => clearInterval(countdownRef.current)
  }, [uiState]) // eslint-disable-line

  const loadNext = useCallback(async (sess) => {
    const s = sess || sessionRef.current
    try {
      const q = await generateNextQuestion({ roleKey: s.roleKey, history: s.history, modeKey: s.modeKey })
      currentQRef.current = q
      setCurrentQ(q)
      qCountRef.current += 1
      setQCount(qCountRef.current)
      setTranscript("")
      // ⭐ Fix 4: pass voice preset key correctly
      speechEngine.speak(q.question, {
        presetKey: config.voice || "indian",
        onStart: () => setUiState(S.ASKING),
        onEnd: () => setUiState(S.COUNTDOWN),
      })
    } catch (err) { console.error("loadNext:", err); setUiState(S.ERROR) }
  }, [config.voice])

  const startRecording = useCallback(async () => {
    clearInterval(countdownRef.current)
    try {
      speechEngine.cancel()
      await recorderRef.current.start()
      recordSecRef.current = 0
      setRecordTime(0)
      recordTimerRef.current = setInterval(() => { recordSecRef.current += 1; setRecordTime(recordSecRef.current) }, 1000)
      setUiState(S.RECORDING)
    } catch (err) { console.error("startRecording:", err); setUiState(S.ERROR) }
  }, [])

  // ⭐ Fix 3: Stop is always manual — user clicks when done
  const stopRecording = useCallback(async () => {
    clearInterval(recordTimerRef.current)
    setUiState(S.PROCESSING)
    const blob = await recorderRef.current.stop()
    if (blob) processAnswer(blob)
    else setUiState(S.ERROR)
  }, []) // eslint-disable-line

  async function processAnswer(blob) {
    try {
      const fd = new FormData(); fd.append("audio", blob)
      const tRes = await fetch("/api/voice/transcribe", { method: "POST", body: fd })
      const tData = await tRes.json()
      const text = tData?.transcript || ""
      setTranscript(text)
      const eRes = await fetch("/api/voice/evaluate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: currentQRef.current?.question, transcript: text, duration: recordSecRef.current })
      })
      const eData = await eRes.json()
      const parsed = extractJSON(eData.raw) ?? { score: 5 }
      updateSessionAfterAnswer({ session: sessionRef.current, evaluation: parsed, skill: currentQRef.current?.skill })
      // ⭐ Fix 1: check question count to end
      if (timeLeft <= 0) {
        endSession()
      } else {
        await loadNext(sessionRef.current)
      }
    } catch (err) { console.error("processAnswer:", err); setUiState(S.ERROR) }
  }

  function endSession() {
    clearInterval(clockRef.current); clearInterval(countdownRef.current); clearInterval(recordTimerRef.current)
    speechEngine.cancel()
    const report = completeSession(sessionRef.current)
    setFinalReport(report)
    setUiState(S.COMPLETED)
  }

  if (uiState === S.COMPLETED) return (
    <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center p-6">
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(rgba(99,102,241,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.04) 1px,transparent 1px)`, backgroundSize: "40px 40px" }} />
      <ReportView report={finalReport} config={config} onRestart={() => router.push("/voice-interview/setup")} />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col">
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(rgba(99,102,241,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.04) 1px,transparent 1px)`, backgroundSize: "40px 40px" }} />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700 capitalize">{config.role?.replace(/_/g, " ")}</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-100 capitalize">{config.mode}</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200 capitalize">{config.voice}</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-mono font-semibold text-slate-700">
          <Clock size={14} className="text-slate-400" />
          <span className={timeLeft < 60 ? "text-red-500" : ""}>{fmt(timeLeft)}</span>
        </div>
      </div>

      {/* Body */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-10 gap-8 max-w-2xl mx-auto w-full">

        <div className="w-full"><ProgressBar current={qCount} total={totalQ} /></div>

        <AIAvatar state={uiState} />

        <div className="text-xs font-medium text-slate-400 -mt-4 h-4 text-center">
          {uiState === S.ASKING && "Interviewer is speaking…"}
          {uiState === S.COUNTDOWN && "Get ready to answer…"}
          {uiState === S.RECORDING && "Recording — speak your answer clearly"}
          {uiState === S.PROCESSING && "Evaluating your response…"}
          {uiState === S.INIT && "Starting interview…"}
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          {currentQ && (
            <motion.div key={currentQ.question}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
              <p className="text-slate-800 text-base font-medium leading-relaxed">{currentQ.question}</p>
              {currentQ.skill && (
                <span className="inline-block mt-3 px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-400 border border-slate-200">
                  {currentQ.skill}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ⭐ Countdown with ring + auto-start + manual early start */}
        <AnimatePresence>
          {uiState === S.COUNTDOWN && (
            <motion.div initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="absolute inset-0 -rotate-90" width="80" height="80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                  <motion.circle cx="40" cy="40" r="34" fill="none" stroke="#6366f1" strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 34}`}
                    animate={{ strokeDashoffset: 2 * Math.PI * 34 * (countdown / 10) }}
                    transition={{ duration: .5 }}
                  />
                </svg>
                <span className="text-2xl font-bold text-indigo-600 z-10">{countdown}</span>
              </div>
              <p className="text-xs text-slate-400">Auto-recording in {countdown}s · or</p>
              <button onClick={startRecording}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-md shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.97] transition-all">
                <Mic size={14} /> Start now
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ⭐ Recording — waveform + manual stop */}
        <AnimatePresence>
          {uiState === S.RECORDING && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 w-full max-w-xs">
              <div className="flex items-center gap-1 h-8">
                {[...Array(12)].map((_, i) => (
                  <motion.div key={i} className="w-1 bg-red-400 rounded-full"
                    animate={{ height: [8, Math.random() * 20 + 8, 8] }}
                    transition={{ duration: .4 + Math.random() * .4, repeat: Infinity, delay: i * .05 }} />
                ))}
              </div>
              <div className="text-sm font-mono font-semibold text-red-500">{fmt(recordTime)}</div>
              <button onClick={stopRecording}
                className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-red-500 text-white font-semibold text-sm shadow-md shadow-red-200 hover:bg-red-600 active:scale-[0.97] transition-all">
                <Square size={14} /> Done — Stop Recording
              </button>
              <p className="text-xs text-slate-400 text-center">Click when you finish your answer</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Processing */}
        {uiState === S.PROCESSING && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-500">Evaluating your response…</p>
            {transcript && (
              <div className="w-full max-w-sm bg-slate-50 rounded-xl border border-slate-200 p-4">
                <p className="text-xs text-slate-400 mb-1">Your answer</p>
                <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">{transcript}</p>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {uiState === S.ERROR && (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-red-500 text-sm font-medium">
              <AlertCircle size={16} /> Something went wrong
            </div>
            <button onClick={() => loadNext(sessionRef.current)}
              className="text-sm text-indigo-600 underline underline-offset-2">
              Skip to next question →
            </button>
          </div>
        )}

        {/* End early */}
        {(uiState === S.COUNTDOWN || uiState === S.RECORDING) && (
          <button onClick={endSession}
            className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2 transition mt-2">
            End interview early
          </button>
        )}

      </div>
    </div>
  )
}