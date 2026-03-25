"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Mic, Clock, Zap, ChevronRight, Code2, Database, Layers, Brain, Users, BarChart2, Server, Coffee, Cpu, TrendingUp, MessageSquare, Briefcase, GraduationCap } from "lucide-react"

// ─── Roles — keys match ROLES config exactly ──────────────────────────────
const ROLES = [
  { key: "frontend_developer",  label: "Frontend Dev",    icon: <Code2 size={16} />,       desc: "React, CSS, JS, DOM" },
  { key: "backend_developer",   label: "Backend Dev",     icon: <Database size={16} />,    desc: "APIs, DBs, Node.js" },
  { key: "fullstack_developer", label: "Full Stack",      icon: <Layers size={16} />,      desc: "End-to-end dev" },
  { key: "react_developer",     label: "React Dev",       icon: <Code2 size={16} />,       desc: "Hooks, Context, perf" },
  { key: "node_developer",      label: "Node.js Dev",     icon: <Server size={16} />,      desc: "Event loop, Express" },
  { key: "dsa_interview",       label: "DSA / Algo",      icon: <Brain size={16} />,       desc: "Arrays, Trees, DP" },
  { key: "system_design",       label: "System Design",   icon: <BarChart2 size={16} />,   desc: "Scale, Architecture" },
  { key: "data_analyst",        label: "Data Analyst",    icon: <TrendingUp size={16} />,  desc: "SQL, Stats, Dashboards" },
  { key: "ml_engineer",         label: "ML Engineer",     icon: <Cpu size={16} />,         desc: "Model serving, pipelines" },
  { key: "ai_engineer",         label: "AI Engineer",     icon: <Coffee size={16} />,      desc: "LLMs, RAG, prompting" },
  { key: "product_manager",     label: "Product Manager", icon: <Briefcase size={16} />,   desc: "Roadmap, metrics, users" },
  { key: "hr_round",            label: "HR Round",        icon: <Users size={16} />,       desc: "Soft skills, culture fit" },
  { key: "behavioural_round",   label: "Behavioural",     icon: <MessageSquare size={16} />, desc: "STAR, decisions" },
  { key: "fresher_mock",        label: "Fresher Mock",    icon: <GraduationCap size={16} />, desc: "Campus placement prep" },
]

// ─── Duration — key matches INTERVIEW_DURATION config ─────────────────────
const DURATIONS = [
  { key: "quick",    label: "5 min",  sub: "Quick round"     },
  { key: "standard", label: "10 min", sub: "Standard"        },
  { key: "focus",    label: "15 min", sub: "Deep dive"       },
  { key: "deep",     label: "20 min", sub: "Full interview"},
]

// ─── Modes — keys match INTERVIEW_MODES config ────────────────────────────
const MODES = [
  { key: "fresher",      label: "Fresher",       color: "#22c55e" },
  { key: "intermediate", label: "Intermediate",  color: "#f59e0b" },
  { key: "advanced",     label: "Advanced",      color: "#ef4444" },
  { key: "faang",        label: "FAANG",         color: "#8b5cf6" },
]

const VOICES = ["indian", "american", "formal", "mentor", "pressure"]

function Pill({ active, onClick, children, accent }) {
  return (
    <button onClick={onClick}
      style={active ? {
        background: accent || "#4f46e5",
        borderColor: accent || "#4f46e5",
        color: "#fff",
        boxShadow: `0 0 0 3px ${(accent || "#4f46e5") + "33"}`
      } : {}}
      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-150
        ${active ? "" : "border-slate-200 text-slate-600 bg-white hover:border-slate-400 hover:bg-slate-50"}`}>
      {children}
    </button>
  )
}

export default function InterviewSetupPage() {
  const router = useRouter()

  const [role,     setRole]     = useState("frontend_developer")
  const [duration, setDuration] = useState("standard")
  const [mode,     setMode]     = useState("fresher")
  const [voice,    setVoice]    = useState("indian")
  const [loading,  setLoading]  = useState(false)

  const selRole     = ROLES.find(r => r.key === role)
  const selDuration = DURATIONS.find(d => d.key === duration)
  const selMode     = MODES.find(m => m.key === mode)

  // Duration label → minutes number for session page
  const durationMinutes = { quick: 5, standard: 10, focus: 15, deep: 20 }

  const handleStart = () => {
    setLoading(true)
    const config = {
      role,
      duration: durationMinutes[duration],
      mode,
      voice,
      durationKey: duration   // send both for safety
    }
    const encoded = encodeURIComponent(JSON.stringify(config))
    router.push(`/voice-interview/session/demo?config=${encoded}`)
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans">
      {/* Grid bg */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(99,102,241,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.04) 1px,transparent 1px)`,
        backgroundSize: "40px 40px"
      }} />

      <div className="relative max-w-3xl mx-auto px-4 py-12 pb-28">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100
                          text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Mic size={12} /> AI Voice Interview
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Configure your interview</h1>
          <p className="text-slate-500 mt-1 text-sm">Choose role, duration and difficulty</p>
        </motion.div>

        <div className="space-y-5">

          {/* ROLE */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Code2 size={14} className="text-indigo-500" /> Interview Role
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ROLES.map(r => (
                <button key={r.key} onClick={() => setRole(r.key)}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all duration-150
                    ${role === r.key
                      ? "border-indigo-500 bg-indigo-50 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}>
                  <span className={`mt-0.5 ${role === r.key ? "text-indigo-600" : "text-slate-400"}`}>
                    {r.icon}
                  </span>
                  <div>
                    <div className={`text-sm font-semibold ${role === r.key ? "text-indigo-700" : "text-slate-700"}`}>
                      {r.label}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{r.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* DURATION */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Clock size={14} className="text-indigo-500" /> Duration
            </h2>
            <div className="grid grid-cols-4 gap-3">
              {DURATIONS.map(d => (
                <button key={d.key} onClick={() => setDuration(d.key)}
                  className={`p-3 rounded-xl border text-center transition-all duration-150
                    ${duration === d.key ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}>
                  <div className={`text-base font-bold ${duration === d.key ? "text-indigo-700" : "text-slate-700"}`}>
                    {d.label}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{d.sub}</div>
                  <div className={`text-[10px] mt-1 font-medium ${duration === d.key ? "text-indigo-400" : "text-slate-300"}`}>
                    {d.questions}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* DIFFICULTY */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Zap size={14} className="text-indigo-500" /> Difficulty
            </h2>
            <div className="flex gap-2 flex-wrap">
              {MODES.map(m => (
                <Pill key={m.key} active={mode === m.key} accent={m.color} onClick={() => setMode(m.key)}>
                  {m.label}
                </Pill>
              ))}
            </div>
          </motion.div>

          {/* VOICE */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Mic size={14} className="text-indigo-500" /> Interviewer Style
            </h2>
            <div className="flex gap-2 flex-wrap">
              {VOICES.map(v => (
                <Pill key={v} active={voice === v} accent="#6366f1" onClick={() => setVoice(v)}>
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </Pill>
              ))}
            </div>
          </motion.div>

        </div>

        {/* Summary + Start */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="mt-8 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Your session</p>
              <p className="text-slate-800 font-semibold text-sm truncate">
                {selRole?.label} · {selDuration?.label} · {selMode?.label}
              </p>
              <p className="text-xs text-slate-400">{selDuration?.questions} · {voice} style</p>
            </div>
            <button onClick={handleStart} disabled={loading}
              className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl
                         font-semibold text-sm bg-indigo-600 text-white shadow-md
                         hover:bg-indigo-700 active:scale-[0.97] transition-all
                         disabled:opacity-60 disabled:cursor-not-allowed">
              {loading
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><Mic size={15} /> Start Interview <ChevronRight size={15} /></>
              }
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  )
}