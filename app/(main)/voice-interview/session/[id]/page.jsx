"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, Square, Clock, AlertCircle } from "lucide-react"

import {
  createSession,
  isSessionOver,
  updateSessionAfterAnswer,
  completeSession
} from "@/lib/interview/engine/sessionEngine"

import { generateNextQuestion } from "@/lib/interview/engine/questionEngine"
import { speechEngine }         from "@/lib/interview/voice/speechEngine"
import { RecorderEngine }       from "@/lib/interview/voice/recorderEngine"
import { STATES, nextState, logTransition } from "@/lib/interview/engine/stateMachine"

// ─── Duration key map (setup sends "5","10","15","20") ─────────────────────
const DURATION_KEY_MAP = {
  "5":  "quick",
  "10": "standard",
  "15": "focus",
  "20": "deep",
  // passthrough if already a key
  quick: "quick", standard: "standard", focus: "focus", deep: "deep"
}

// ─── Safe JSON extractor ───────────────────────────────────────────────────
function extractJSON(raw) {
  if (!raw) return null
  let cleaned = raw.replace(/```json[\s\S]*?```/gi, m =>
    m.replace(/```json/gi, "").replace(/```/g, "")
  ).replace(/```/g, "").trim()
  let start = -1, depth = 0, end = -1
  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] === "{") { if (start === -1) start = i; depth++ }
    else if (cleaned[i] === "}") { depth--; if (depth === 0 && start !== -1) { end = i; break } }
  }
  if (start === -1 || end === -1) return null
  try { return JSON.parse(cleaned.slice(start, end + 1)) } catch { return null }
}

function fmt(s) {
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, "0")}`
}

// ─── AI Avatar ────────────────────────────────────────────────────────────
function AIAvatar({ state }) {
  const speaking   = state === STATES.ASKING
  const processing = state === STATES.PROCESSING

  return (
    <div className="relative flex items-center justify-center w-28 h-28">
      {speaking && [1, 2, 3].map(i => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-indigo-400"
          initial={{ width: 112, height: 112, opacity: 0.6 }}
          animate={{ width: 112 + i * 28, height: 112 + i * 28, opacity: 0 }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4, ease: "easeOut" }}
        />
      ))}
      <div className="w-28 h-28 rounded-full flex items-center justify-center
                      bg-gradient-to-br from-indigo-500 to-indigo-700
                      shadow-lg shadow-indigo-200">
        {processing ? (
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <motion.div key={i} className="w-2 h-2 bg-white rounded-full"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
            ))}
          </div>
        ) : (
          <span className="text-white font-bold text-xl">AI</span>
        )}
      </div>
    </div>
  )
}

// ─── Progress bar ──────────────────────────────────────────────────────────
function ProgressBar({ current, total }) {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0
  return (
    <div className="flex items-center gap-3 w-full">
      <span className="text-xs text-slate-400 font-medium w-14">Q {current}/{total}</span>
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div className="h-full bg-indigo-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4 }} />
      </div>
      <span className="text-xs text-slate-400 font-medium w-8 text-right">{pct}%</span>
    </div>
  )
}

// ─── Report view ───────────────────────────────────────────────────────────
function ReportView({ report, config, onRestart }) {
  const score = Number(report?.averageScore) || 0
  const color = score >= 8 ? "#22c55e" : score >= 5 ? "#f59e0b" : "#ef4444"
  const label = score >= 8 ? "Excellent" : score >= 5 ? "Good" : "Needs Work"

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg mx-auto space-y-5">

      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-3">
          Interview Complete
        </p>
        <div className="text-7xl font-bold mb-1" style={{ color }}>
          {score.toFixed(1)}
        </div>
        <div className="text-sm font-semibold text-slate-500">{label}</div>
        <div className="text-xs text-slate-400 mt-1">
          {config?.role} · {config?.mode} · {config?.duration} min
        </div>
      </div>

      {report?.scores?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Question Breakdown
          </p>
          {report.scores.map((s, i) => {
            const c = s.score >= 8 ? "#22c55e" : s.score >= 5 ? "#f59e0b" : "#ef4444"
            return (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-16 truncate">{s.skill}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(s.score / 10) * 100}%`, background: c }} />
                </div>
                <span className="text-xs font-semibold w-8 text-right" style={{ color: c }}>
                  {s.score}/10
                </span>
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
        className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm
                   hover:bg-indigo-700 active:scale-[0.98] transition-all">
        Start New Interview
      </button>
    </motion.div>
  )
}

// ─── Main session page ─────────────────────────────────────────────────────
export default function VoiceInterviewSessionPage() {
  const params = useSearchParams()
  const router = useRouter()

  // ── Parse config ──────────────────────────────────────────────────────
  const config = (() => {
    try {
      const raw = params.get("config")
      if (raw) return JSON.parse(decodeURIComponent(raw))
    } catch {}
    return { role: "frontend_developer", mode: "fresher", duration: 10, voice: "indian" }
  })()

  // Map duration number → duration key
  const durationKey = DURATION_KEY_MAP[String(config.duration)] || "standard"

  // ── State ─────────────────────────────────────────────────────────────
  const [uiState,     setUiState]     = useState(STATES.INIT)
  const [currentQ,    setCurrentQ]    = useState(null)
  const [thinking,    setThinking]    = useState(5)
  const [recordTime,  setRecordTime]  = useState(0)
  const [timeLeft,    setTimeLeft]    = useState((config.duration || 10) * 60)
  const [finalReport, setFinalReport] = useState(null)
  const [transcript,  setTranscript]  = useState("")
  const [qCount,      setQCount]      = useState(0)
  const totalQ = Math.max(3, Math.round((config.duration || 10) / 1.8))

  // ── Refs (stable across renders) ──────────────────────────────────────
  const sessionRef    = useRef(null)
  const currentQRef   = useRef(null)
  const recorderRef   = useRef(null)
  const recordTimerRef = useRef(null)
  const clockRef      = useRef(null)
  const recordSecRef  = useRef(0)

  // ── Transition helper ─────────────────────────────────────────────────
  const go = useCallback((event) => {
    setUiState(prev => {
      const next = nextState(prev, event)
      logTransition(prev, event, next)
      return next
    })
  }, [])

  // ── Init session ──────────────────────────────────────────────────────
  useEffect(() => {
    const s = createSession({
      roleKey:    config.role    || "frontend_developer",
      modeKey:    config.mode    || "fresher",
      durationKey
    })
    sessionRef.current  = s
    recorderRef.current = new RecorderEngine()

    // Unlock speech synthesis
    speechEngine.unlock()

    // Start countdown clock
    clockRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(clockRef.current); endSession(); return 0 }
        return t - 1
      })
    }, 1000)

    loadNext(s)

    return () => {
      clearInterval(clockRef.current)
      clearInterval(recordTimerRef.current)
      speechEngine.cancel()
    }
  }, []) // eslint-disable-line

  // ── Think timer ───────────────────────────────────────────────────────
  useEffect(() => {
    if (uiState !== STATES.THINKING) return
    const t = setInterval(() => {
      setThinking(v => {
        if (v <= 1) { clearInterval(t); go("THINK_DONE"); return 5 }
        return v - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [uiState]) // eslint-disable-line

  // ── Load next question ────────────────────────────────────────────────
  const loadNext = useCallback(async (sess) => {
    const s = sess || sessionRef.current
    try {
      const q = await generateNextQuestion({
        roleKey: s.roleKey,
        history: s.history,
        modeKey: s.modeKey
      })
      currentQRef.current = q
      setCurrentQ(q)
      setQCount(c => c + 1)
      setTranscript("")

      speechEngine.speak(q.question, {
        presetKey: config.voice || "indian",
        onStart:   () => go("SPEECH_START"),
        onEnd:     () => go("SPEECH_END")
      })

    } catch (err) {
      console.error("loadNext error:", err)
      go("ERROR")
    }
  }, []) // eslint-disable-line

  // ── Start recording ───────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      speechEngine.cancel()
      await recorderRef.current.start()
      recordSecRef.current = 0
      setRecordTime(0)
      recordTimerRef.current = setInterval(() => {
        recordSecRef.current += 1
        setRecordTime(recordSecRef.current)
      }, 1000)
      go("START_RECORDING")
    } catch (err) {
      console.error("startRecording error:", err)
      go("ERROR")
    }
  }

  // ── Stop recording ────────────────────────────────────────────────────
  const stopRecording = async () => {
    clearInterval(recordTimerRef.current)
    go("STOP_RECORDING")
    const blob = await recorderRef.current.stop()
    if (blob) processAnswer(blob)
    else go("ERROR")
  }

  // ── Process answer ────────────────────────────────────────────────────
  async function processAnswer(blob) {
    try {
      // 1. Transcribe
      const fd = new FormData()
      fd.append("audio", blob)
      const tRes  = await fetch("/api/voice/transcribe", { method: "POST", body: fd })
      const tData = await tRes.json()
      const text  = tData?.transcript || ""
      setTranscript(text)

      // 2. Evaluate
      const eRes = await fetch("/api/voice/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question:   currentQRef.current?.question,
          transcript: text,
          duration:   recordSecRef.current
        })
      })
      const eData  = await eRes.json()
      const parsed = extractJSON(eData.raw) ?? { score: 5, feedback: "Answer noted." }

      // 3. Update session
      updateSessionAfterAnswer({
        session:    sessionRef.current,
        evaluation: parsed,
        skill:      currentQRef.current?.skill
      })

      go("EVAL_DONE")

      // 4. Decide: next question or end
      if (isSessionOver(sessionRef.current) || qCount >= totalQ) {
        endSession()
      } else {
        go("NEXT_QUESTION")
        await loadNext(sessionRef.current)
      }

    } catch (err) {
      console.error("processAnswer error:", err)
      go("ERROR")
    }
  }

  // ── End session ───────────────────────────────────────────────────────
  function endSession() {
    clearInterval(clockRef.current)
    speechEngine.cancel()
    const report = completeSession(sessionRef.current)
    setFinalReport(report)
    setUiState(STATES.COMPLETED)
  }

  // ─── COMPLETED ──────────────────────────────────────────────────────────
  if (uiState === STATES.COMPLETED) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center p-6">
        <div className="fixed inset-0 pointer-events-none" style={{
          backgroundImage: `linear-gradient(rgba(99,102,241,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.04) 1px,transparent 1px)`,
          backgroundSize: "40px 40px"
        }} />
        <ReportView
          report={finalReport}
          config={config}
          onRestart={() => router.push("/voice-interview/setup")}
        />
      </div>
    )
  }

  // ─── INTERVIEW UI ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col">

      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(99,102,241,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.04) 1px,transparent 1px)`,
        backgroundSize: "40px 40px"
      }} />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4
                      bg-white border-b border-slate-200">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-700 capitalize">
            {config.role?.replace(/_/g, " ")}
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium
                           bg-indigo-50 text-indigo-600 border border-indigo-100 capitalize">
            {config.mode}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm font-mono font-semibold text-slate-700">
          <Clock size={14} className="text-slate-400" />
          <span className={timeLeft < 60 ? "text-red-500" : ""}>{fmt(timeLeft)}</span>
        </div>
      </div>

      {/* Body */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center
                      px-6 py-10 gap-8 max-w-2xl mx-auto w-full">

        <div className="w-full">
          <ProgressBar current={qCount} total={totalQ} />
        </div>

        <AIAvatar state={uiState} />

        {/* Status label */}
        <div className="text-xs font-medium text-slate-400 -mt-4 h-4">
          {uiState === STATES.ASKING     && "Interviewer is speaking…"}
          {uiState === STATES.THINKING   && "Think before you answer…"}
          {uiState === STATES.READY      && "Ready — record your answer"}
          {uiState === STATES.RECORDING  && "Recording your answer"}
          {uiState === STATES.PROCESSING && "Evaluating your response…"}
          {uiState === STATES.INIT       && "Loading interview…"}
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          {currentQ && (
            <motion.div key={currentQ.question}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
              <p className="text-slate-800 text-base font-medium leading-relaxed">
                {currentQ.question}
              </p>
              {currentQ.skill && (
                <span className="inline-block mt-3 px-2 py-0.5 rounded-full text-xs
                                 bg-slate-100 text-slate-400 border border-slate-200">
                  {currentQ.skill}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Thinking countdown */}
        <AnimatePresence>
          {uiState === STATES.THINKING && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="text-4xl font-bold text-indigo-600">
              {thinking}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transcript preview */}
        <AnimatePresence>
          {transcript && uiState === STATES.PROCESSING && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="w-full bg-slate-50 rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-400 font-medium mb-1">Your answer</p>
              <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{transcript}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className="flex flex-col items-center gap-3 w-full max-w-xs">

          {uiState === STATES.READY && (
            <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              onClick={startRecording}
              className="w-full flex items-center justify-center gap-2 h-12 rounded-xl
                         bg-indigo-600 text-white font-semibold text-sm
                         shadow-md shadow-indigo-200 hover:bg-indigo-700
                         active:scale-[0.97] transition-all">
              <Mic size={16} /> Record Answer
            </motion.button>
          )}

          {uiState === STATES.RECORDING && (
            <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              onClick={stopRecording}
              className="w-full flex items-center justify-center gap-2 h-12 rounded-xl
                         bg-red-500 text-white font-semibold text-sm
                         shadow-md shadow-red-200 hover:bg-red-600
                         active:scale-[0.97] transition-all">
              <Square size={14} /> Stop · {fmt(recordTime)}
            </motion.button>
          )}

          {uiState === STATES.PROCESSING && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              Evaluating…
            </div>
          )}

          {uiState === STATES.ERROR && (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex items-center gap-2 text-red-500 text-sm font-medium">
                <AlertCircle size={16} /> Something went wrong
              </div>
              <button onClick={() => loadNext(sessionRef.current)}
                className="text-sm text-indigo-600 underline underline-offset-2">
                Skip to next question →
              </button>
            </div>
          )}

          {(uiState === STATES.READY || uiState === STATES.RECORDING) && (
            <button onClick={endSession}
              className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2 transition">
              End interview early
            </button>
          )}
        </div>
      </div>
    </div>
  )
}