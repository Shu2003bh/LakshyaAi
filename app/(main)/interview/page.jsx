"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Code2, Database, Layers, Server, Cpu, Coffee,
  Users, MessageSquare, Briefcase, GraduationCap,
  BarChart2, TrendingUp, Clock, ChevronRight, Mic,
  Zap, Target, CheckCircle2, Trophy, ArrowRight,
  Sparkles, Filter, Play,
} from "lucide-react";
import { startTimedInterview, getInterviewHistory } from "@/actions/interview";
import { toast } from "sonner";
import { format } from "date-fns";

/* ─── Role definitions ──────────────────────────────────────────── */
const ROLES = [
  { key: "Frontend Developer",  label: "Frontend Dev",    icon: Code2,          desc: "React, CSS, JS, DOM", color: "#10b981", bg: "#ecfdf5" },
  { key: "Backend Developer",   label: "Backend Dev",     icon: Database,       desc: "APIs, DBs, Node.js",  color: "#3b82f6", bg: "#eff6ff" },
  { key: "Full Stack Developer",label: "Full Stack",      icon: Layers,         desc: "End-to-end dev",      color: "#8b5cf6", bg: "#f5f3ff" },
  { key: "React Developer",     label: "React Dev",       icon: Code2,          desc: "Hooks, Context, perf",color: "#06b6d4", bg: "#ecfeff" },
  { key: "Node.js Developer",   label: "Node.js Dev",     icon: Server,         desc: "Event loop, Express", color: "#22c55e", bg: "#f0fdf4" },
  { key: "DSA Interview",       label: "DSA / Algo",      icon: Brain,          desc: "Arrays, Trees, DP",   color: "#6366f1", bg: "#eef2ff" },
  { key: "System Design",       label: "System Design",   icon: BarChart2,      desc: "Scale, Architecture", color: "#f97316", bg: "#fff7ed" },
  { key: "Data Analyst",        label: "Data Analyst",     icon: TrendingUp,    desc: "SQL, Stats, Dashboards", color: "#14b8a6", bg: "#f0fdfa" },
  { key: "ML Engineer",         label: "ML Engineer",     icon: Cpu,            desc: "Model serving, pipelines", color: "#ef4444", bg: "#fef2f2" },
  { key: "AI Engineer",         label: "AI Engineer",     icon: Coffee,         desc: "LLMs, RAG, prompting",color: "#a855f7", bg: "#faf5ff" },
  { key: "Product Manager",     label: "Product Manager", icon: Briefcase,      desc: "Roadmap, metrics",    color: "#ec4899", bg: "#fdf2f8" },
  { key: "HR Round",            label: "HR Round",        icon: Users,          desc: "Soft skills, culture",color: "#f59e0b", bg: "#fffbeb" },
  { key: "Behavioral",          label: "Behavioral",      icon: MessageSquare,  desc: "STAR, decisions",     color: "#84cc16", bg: "#f7fee7" },
  { key: "Fresher Mock",        label: "Fresher Mock",    icon: GraduationCap,  desc: "Campus placement",    color: "#6366f1", bg: "#eef2ff" },
];

const DIFFICULTIES = [
  { key: "Mixed", label: "Mixed", color: "#6366f1" },
  { key: "Easy",  label: "Easy",  color: "#22c55e" },
  { key: "Medium",label: "Medium",color: "#f59e0b" },
  { key: "Hard",  label: "Hard",  color: "#ef4444" },
];

/* ─── Component ────────────────────────────────────────────────── */
export default function InterviewStartPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("Frontend Developer");
  const [difficulty, setDifficulty] = useState("Mixed");
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    getInterviewHistory()
      .then(setHistory)
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, []);

  const handleStart = async () => {
    try {
      setLoading(true);
      const session = await startTimedInterview(selectedRole, difficulty);
      router.push(`/interview/session/${session.id}`);
    } catch (err) {
      toast.error("Failed to start interview");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const completedSessions = history.filter((s) => s.status === "completed");
  const avgScore = completedSessions.length > 0
    ? Math.round(completedSessions.reduce((sum, s) => sum + (s.totalScore ?? 0), 0) / completedSessions.length)
    : 0;

  const selectedRoleData = ROLES.find((r) => r.key === selectedRole);

  return (
    <div className="min-h-screen">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Brain size={20} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              AI Mock Interview
            </h1>
            <p className="text-sm text-slate-400">
              Practice with role-specific MCQ questions powered by AI
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
      >
        {[
          { label: "Total Sessions", value: completedSessions.length, icon: Target, iconBg: "#eef2ff", iconColor: "#6366f1" },
          { label: "Avg Score", value: avgScore ? `${avgScore}%` : "—", icon: TrendingUp, iconBg: "#ecfdf5", iconColor: "#10b981" },
          { label: "Questions Solved", value: history.reduce((s, h) => s + (h.attempts?.length || 0), 0), icon: CheckCircle2, iconBg: "#fff7ed", iconColor: "#f97316" },
          { label: "Best Score", value: completedSessions.length > 0 ? `${Math.max(...completedSessions.map((s) => s.totalScore ?? 0))}%` : "—", icon: Trophy, iconBg: "#fef9c3", iconColor: "#ca8a04" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: stat.iconBg }}>
                <stat.icon size={13} style={{ color: stat.iconColor }} />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
          </div>
        ))}
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left Column — Configuration */}
        <div className="lg:col-span-2 space-y-5">

          {/* Role Selection */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
          >
            <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Sparkles size={14} className="text-indigo-500" />
              Select Interview Role
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {ROLES.map((role) => {
                const Icon = role.icon;
                const isActive = selectedRole === role.key;
                return (
                  <button
                    key={role.key}
                    onClick={() => setSelectedRole(role.key)}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all duration-150 ${
                      isActive
                        ? "border-indigo-300 bg-indigo-50 shadow-sm"
                        : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: isActive ? role.bg : "#f1f5f9" }}
                    >
                      <Icon size={13} style={{ color: isActive ? role.color : "#94a3b8" }} />
                    </div>
                    <div className="min-w-0">
                      <div className={`text-xs font-semibold truncate ${isActive ? "text-indigo-700" : "text-slate-600"}`}>
                        {role.label}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{role.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Difficulty Selection */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
          >
            <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Filter size={14} className="text-indigo-500" />
              Difficulty Level
            </h2>
            <div className="flex gap-2 flex-wrap">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.key}
                  onClick={() => setDifficulty(d.key)}
                  className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-150 ${
                    difficulty === d.key
                      ? "text-white shadow-sm"
                      : "border-slate-200 text-slate-500 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                  style={
                    difficulty === d.key
                      ? { background: d.color, borderColor: d.color }
                      : {}
                  }
                >
                  {d.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Start Button */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
          >
            <div className="flex items-center gap-4">
              {/* Summary */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{ background: selectedRoleData?.bg }}
                  >
                    {selectedRoleData && <selectedRoleData.icon size={12} style={{ color: selectedRoleData.color }} />}
                  </div>
                  <span className="text-sm font-semibold text-slate-700">
                    {selectedRoleData?.label}
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs font-medium text-slate-400">{difficulty}</span>
                </div>
                <p className="text-xs text-slate-400">
                  10 MCQ questions · 20 min timer · AI-generated · Explanations included
                </p>
              </div>

              {/* Start CTA */}
              <button
                onClick={handleStart}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 active:scale-[0.97] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex-shrink-0"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Play size={15} />
                    Start Interview
                    <ChevronRight size={15} />
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Voice Interview CTA */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <button
              onClick={() => router.push("/voice-interview/setup")}
              className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50 hover:border-indigo-200 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <Mic size={16} className="text-indigo-600" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-slate-700">
                    Try Voice Interview
                  </div>
                  <div className="text-xs text-slate-400">
                    Practice with AI voice — speak your answers aloud
                  </div>
                </div>
              </div>
              <ArrowRight size={16} className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>

        {/* Right Column — History */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 h-fit"
        >
          <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <Clock size={14} className="text-indigo-500" />
            Recent Sessions
          </h2>

          {loadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          ) : completedSessions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
                <Target size={20} className="text-slate-300" />
              </div>
              <p className="text-sm text-slate-400">No sessions yet</p>
              <p className="text-xs text-slate-300 mt-1">
                Start your first interview above!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {completedSessions.slice(0, 8).map((session) => {
                const score = session.totalScore ?? 0;
                const scoreColor = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";
                const correct = session.attempts?.filter((a) => a.isCorrect).length ?? 0;
                const total = session.attempts?.length ?? 0;

                return (
                  <button
                    key={session.id}
                    onClick={() => router.push(`/interview/result/${session.id}`)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-50 hover:border-slate-100 hover:bg-slate-50 transition-all text-left group"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{ background: scoreColor + "15", color: scoreColor }}
                    >
                      {score}%
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-600 truncate">
                        {session.role}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {correct}/{total} correct · {format(new Date(session.createdAt), "d MMM")}
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-400 transition-colors flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}