"use client";
// "use client"

// import React from "react"
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts"

// import {
//   BriefcaseIcon,
//   LineChart,
//   TrendingUp,
//   TrendingDown,
//   Brain,
// } from "lucide-react"

// import { format, formatDistanceToNow } from "date-fns"

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"

// import { Badge } from "@/components/ui/badge"
// import { Progress } from "@/components/ui/progress"

// import { generateSkillRoadmap } from "@/actions/industry-insight"
// import { toggleRoadmapStep } from "@/actions/industry-insight"

// const DashboardView = ({ insights }) => {

//   const [activeRoadmap, setActiveRoadmap] = React.useState(null)
//   const [loadingSkill, setLoadingSkill] = React.useState(null)

//   // ⭐ skill click handler
//   const handleSkillClick = async (skill) => {
//     try {
//       setActiveRoadmap(null)
//       setLoadingSkill(skill)

//       const data = await generateSkillRoadmap(skill)
//       setActiveRoadmap(data)

//     } catch (e) {
//       console.error(e)
//     } finally {
//       setLoadingSkill(null)
//     }
//   }

//   // ⭐ toggle step
//   const handleToggle = async (stepId) => {
//     await toggleRoadmapStep(stepId)

//     // optimistic UI update
//     setActiveRoadmap(prev => ({
//       ...prev,
//       steps: prev.steps.map(s =>
//         s.id === stepId
//           ? { ...s, completed: !s.completed }
//           : s
//       )
//     }))
//   }

//   // ⭐ progress calc
//   const progress = activeRoadmap
//     ? Math.round(
//         (activeRoadmap.steps.filter(s => s.completed).length /
//           activeRoadmap.steps.length) *
//           100
//       )
//     : 0

//   // ⭐ salary chart data
//   const salaryData = insights.salaryRanges.map(r => ({
//     name: r.role,
//     min: r.min / 1000,
//     median: r.median / 1000,
//     max: r.max / 1000
//   }))

//   const getDemandColor = (level) => {
//     if (level === "High") return "bg-green-500"
//     if (level === "Medium") return "bg-yellow-500"
//     return "bg-red-500"
//   }

//   const getOutlook = (outlook) => {
//     if (outlook === "Positive") return { icon: TrendingUp, color: "text-green-500" }
//     if (outlook === "Negative") return { icon: TrendingDown, color: "text-red-500" }
//     return { icon: LineChart, color: "text-yellow-500" }
//   }

//   const OutlookIcon = getOutlook(insights.marketOutlook).icon
//   const outlookColor = getOutlook(insights.marketOutlook).color

//   const lastUpdated = format(new Date(insights.lastUpdated), "dd/MM/yyyy")
//   const nextUpdate = formatDistanceToNow(new Date(insights.nextUpdate), { addSuffix: true })

//   return (
//     <div className="space-y-6">

//       {/* ⭐ Header */}
//       <div className="flex justify-between">
//         <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
//           Last Updated: {lastUpdated}
//         </Badge>
//       </div>

//       {/* ⭐ Overview Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

//         <Card>
//           <CardHeader className="flex flex-row justify-between pb-2">
//             <CardTitle className="text-sm">Market Outlook</CardTitle>
//             <OutlookIcon className={`h-4 w-4 ${outlookColor}`} />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{insights.marketOutlook}</div>
//             <p className="text-xs text-muted-foreground">
//               Next update {nextUpdate}
//             </p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row justify-between pb-2">
//             <CardTitle className="text-sm">Industry Growth</CardTitle>
//             <TrendingUp className="h-4 w-4" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">
//               {insights.growthRate.toFixed(1)}%
//             </div>
//             <Progress value={insights.growthRate} className="mt-2" />
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row justify-between pb-2">
//             <CardTitle className="text-sm">Demand Level</CardTitle>
//             <BriefcaseIcon className="h-4 w-4" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{insights.demandLevel}</div>
//             <div className={`h-2 mt-2 rounded ${getDemandColor(insights.demandLevel)}`} />
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle className="text-sm">Top Skills</CardTitle>
//           </CardHeader>
//           <CardContent className="flex flex-wrap gap-2">
//             {insights.topSkills.map(skill => (
//               <Badge
//                 key={skill}
//                 onClick={() => handleSkillClick(skill)}
//                 className="cursor-pointer bg-indigo-100 text-indigo-700"
//               >
//                 {loadingSkill === skill ? "Loading..." : skill}
//               </Badge>
//             ))}
//           </CardContent>
//         </Card>

//       </div>

//       {/* ⭐ Salary Chart */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Salary Trends</CardTitle>
//         </CardHeader>
//         <CardContent className="h-[350px]">
//           <ResponsiveContainer>
//             <BarChart data={salaryData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="name" />
//               <YAxis />
//               <Tooltip />
//               <Bar dataKey="min" fill="#a5b4fc" />
//               <Bar dataKey="median" fill="#818cf8" />
//               <Bar dataKey="max" fill="#6366f1" />
//             </BarChart>
//           </ResponsiveContainer>
//         </CardContent>
//       </Card>

//       {/* ⭐ Recommended Skills */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Recommended Skills</CardTitle>
//         </CardHeader>
//         <CardContent className="flex flex-wrap gap-2">
//           {insights.recommendedSkills.map(skill => (
//             <Badge
//               key={skill}
//               onClick={() => handleSkillClick(skill)}
//               className="cursor-pointer bg-purple-100 text-purple-700"
//             >
//               {loadingSkill === skill ? "Loading..." : skill}
//             </Badge>
//           ))}
//         </CardContent>
//       </Card>

//       {/* ⭐ Active Roadmap */}
//       {activeRoadmap && (
//         <Card>
//           <CardHeader>
//             <CardTitle>
//               Continue Learning — {activeRoadmap.skill}
//             </CardTitle>
//             <CardDescription>
//               {progress}% Completed
//             </CardDescription>
//           </CardHeader>

//           <CardContent className="space-y-4">

//             <Progress value={progress} />

//             <ul className="space-y-3">
//               {activeRoadmap.steps.map(step => (
//                 <li key={step.id} className="p-3 border rounded-lg hover:bg-gray-50">

//                   <div className="flex gap-2 items-center">
//                     <input
//                       type="checkbox"
//                       checked={step.completed}
//                       onChange={() => handleToggle(step.id)}
//                     />
//                     <span className="font-medium text-indigo-600">
//                       {step.title}
//                     </span>
//                   </div>

//                   <p className="text-sm text-gray-600 mt-1">
//                     {step.description}
//                   </p>

//                 </li>
//               ))}
//             </ul>

//           </CardContent>
//         </Card>
//       )}

//     </div>
//   )
// }

// export default DashboardView


"use client";

import React, { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Brain, Flame, Star, Trophy, ChevronRight, Zap,
  BookOpen, Code2, Database, Globe, Server, Activity,
  Clock, BarChart2, Layers, CheckCircle2, Circle,
  TrendingUp, TrendingDown, BriefcaseIcon, Award,
  FileText, Cpu, Target, Sparkles, GraduationCap,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { generateSkillRoadmap, toggleRoadmapStep } from "@/actions/industry-insight";

/* ─── skill meta ─── */
const SKILL_META = {
  DSA:      { color: "#6366f1", bg: "#eef2ff", icon: Code2 },
  DBMS:     { color: "#ef4444", bg: "#fef2f2", icon: Database },
  OS:       { color: "#f97316", bg: "#fff7ed", icon: Layers },
  CN:       { color: "#f97316", bg: "#fff7ed", icon: Globe },
  Frontend: { color: "#10b981", bg: "#ecfdf5", icon: Globe },
  Backend:  { color: "#3b82f6", bg: "#eff6ff", icon: Server },
  default:  { color: "#8b5cf6", bg: "#f5f3ff", icon: Cpu },
};
const getSkillMeta = (name) => SKILL_META[name] || SKILL_META.default;

const DEFAULT_TASKS = [
  { id: 1, label: "Solve 5 DSA problems", done: false },
  { id: 2, label: "Revise DBMS Joins", done: false },
  { id: 3, label: "Attempt 1 Mock Interview", done: false },
  { id: 4, label: "OS Quiz — Memory Mgmt", done: false },
  { id: 5, label: "CN — TCP/IP Revision", done: false },
];

const MOCK_LEADERBOARD = [
  { rank: 1, name: "Priya R.",   pts: 4820, initials: "PR", color: "#10b981" },
  { rank: 2, name: "You",        pts: 0,    initials: "ME", color: "#6366f1", you: true },
  { rank: 3, name: "Rahul S.",   pts: 3210, initials: "RS", color: "#3b82f6" },
  { rank: 4, name: "Neha A.",    pts: 2990, initials: "NA", color: "#f97316" },
  { rank: 5, name: "Dev M.",     pts: 2740, initials: "DM", color: "#8b5cf6" },
];

const levelName = (lvl) =>
  ["", "Beginner", "Learner", "Practitioner", "Explorer", "Specialist", "Expert"][lvl] ?? "Expert";

const getDemandColor = (level) =>
  level === "High" ? "#10b981" : level === "Medium" ? "#f59e0b" : "#ef4444";

const getDemandBg = (level) =>
  level === "High" ? "#ecfdf5" : level === "Medium" ? "#fffbeb" : "#fef2f2";

/* ─── Tooltip ─── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs shadow-lg">
      <div className="font-semibold text-slate-700 mb-1">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <span className="font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── Stat Card ─── */
function StatCard({ label, value, sub, subGood, progress, progressColor, icon: Icon, iconBg, iconColor }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-2 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{label}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: iconBg }}>
            <Icon size={15} style={{ color: iconColor }} />
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-slate-800 tracking-tight">{value}</div>
      {sub !== undefined && (
        <div className={`text-xs font-medium ${subGood ? "text-emerald-500" : "text-slate-400"}`}>{sub}</div>
      )}
      {progress !== undefined && (
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-1">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.min(progress, 100)}%`, background: progressColor || "#6366f1" }}
          />
        </div>
      )}
    </div>
  );
}

/* ─── Section Card ─── */
function Card({ title, titleRight, children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-5 ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-slate-700 tracking-wide">{title}</span>
          {titleRight}
        </div>
      )}
      {children}
    </div>
  );
}

/* ─── Skill Bar ─── */
function SkillBar({ name, pct, xp, level }) {
  const { color, bg, icon: Icon } = getSkillMeta(name);
  const label = pct >= 70 ? "Strong" : pct >= 50 ? "Growing" : "Needs Work";
  const labelColor = pct >= 70 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";
  const labelBg   = pct >= 70 ? "#ecfdf5" : pct >= 50 ? "#fffbeb" : "#fef2f2";
  return (
    <div className="flex items-center gap-3 mb-3 last:mb-0">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
        <Icon size={14} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-slate-600">{name}</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ color: labelColor, background: labelBg }}>{label}</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
        </div>
      </div>
      <span className="text-xs font-bold text-slate-500 w-8 text-right">{pct}%</span>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════ */
export default function DashboardView({ insights, dashboardData }) {
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [loadingSkill, setLoadingSkill]   = useState(null);
  const [tasks, setTasks]                 = useState(DEFAULT_TASKS);
  const [lbTab, setLbTab]                 = useState("weekly");

  /* derive from real data or fallback */
  const stats       = dashboardData?.stats        ?? {};
  const trend       = dashboardData?.performanceTrend ?? [];
  const analytics   = dashboardData?.interviewAnalytics ?? {};
  const skillXP     = dashboardData?.skillXP      ?? [];
  const roadmaps    = dashboardData?.roadmapProgress ?? [];
  const breakdown   = dashboardData?.assessmentBreakdown ?? [];
  const lastFeedback= dashboardData?.lastFeedback  ?? null;
  const userName    = dashboardData?.user?.name    ?? "there";
  const userSkills  = dashboardData?.user?.skills  ?? [];

  const totalXP   = stats.totalXP   ?? 0;
  const maxLevel  = stats.maxLevel  ?? 1;
  const streak    = stats.streak    ?? 0;
  const xpToNext  = (maxLevel + 1) * 1000;
  const xpPct     = Math.min(Math.round((totalXP % 1000) / 10), 100);

  /* ── roadmap handlers ── */
  const handleSkillClick = async (skill) => {
    try {
      setActiveRoadmap(null);
      setLoadingSkill(skill);
      const data = await generateSkillRoadmap(skill);
      setActiveRoadmap(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSkill(null);
    }
  };

  const handleToggle = async (stepId) => {
    await toggleRoadmapStep(stepId);
    setActiveRoadmap((prev) => ({
      ...prev,
      steps: prev.steps.map((s) =>
        s.id === stepId ? { ...s, completed: !s.completed } : s
      ),
    }));
  };

  const toggleTask = (id) =>
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, done: !t.done } : t));

  const roadmapProgress = activeRoadmap
    ? Math.round(
        (activeRoadmap.steps.filter((s) => s.completed).length /
          activeRoadmap.steps.length) * 100
      )
    : 0;

  /* ── salary chart ── */
  const salaryData = (insights?.salaryRanges ?? []).map((r) => ({
    name: r.role?.length > 14 ? r.role.slice(0, 14) + "…" : r.role,
    Min:    Math.round((r.min    ?? 0) / 1000),
    Median: Math.round((r.median ?? 0) / 1000),
    Max:    Math.round((r.max    ?? 0) / 1000),
  }));

  /* ── radar data ── */
  const radarData = [
    { subject: "Clarity",       value: analytics.clarity      ?? 0, fullMark: 100 },
    { subject: "Depth",         value: analytics.depth        ?? 0, fullMark: 100 },
    { subject: "Communication", value: analytics.communication ?? 0, fullMark: 100 },
  ];

  /* ── skill bars: prefer real skillXP else from user.skills ── */
  const skillBars = skillXP.length
    ? skillXP.map((s) => ({
        name: s.skill,
        pct:  Math.min(Math.round((s.xp / 1000) * 100), 100),
        xp:   s.xp,
        level: s.level,
      }))
    : userSkills.slice(0, 6).map((sk) => ({
        name: sk,
        pct: 50,
        xp: 0,
        level: 1,
      }));

  /* ── leaderboard with real XP for "You" ── */
  const leaderboard = MOCK_LEADERBOARD.map((e) =>
    e.you ? { ...e, pts: totalXP } : e
  ).sort((a, b) => b.pts - a.pts).map((e, i) => ({ ...e, rank: i + 1 }));

  const OutlookIcon = getOutlookIcon(insights?.marketOutlook);
  const lastUpdated = insights?.lastUpdated
    ? format(new Date(insights.lastUpdated), "dd MMM yyyy") : "—";
  const nextUpdate = insights?.nextUpdate
    ? formatDistanceToNow(new Date(insights.nextUpdate), { addSuffix: true }) : "—";

  const doneTasks   = tasks.filter((t) => t.done).length;
  const taskPct     = Math.round((doneTasks / tasks.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">

      {/* ══ HEADER ══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pt-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Welcome back,{" "}
            <span className="text-indigo-600">{userName.split(" ")[0]}</span> 👋
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {format(new Date(), "EEEE, d MMM yyyy")} · Your career journey continues
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {streak > 0 && (
            <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-600 text-xs font-semibold px-3 py-1.5 rounded-xl">
              <Flame size={13} /> {streak}-day streak
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-xl">
            <Star size={13} /> Level {maxLevel} · {levelName(maxLevel)}
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-500 text-xs px-3 py-1.5 rounded-xl">
            <Clock size={12} /> Updated {lastUpdated}
          </div>
        </div>
      </div>

      {/* ══ AI COACH ══ */}
      <div className="mb-6 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 p-4 flex items-start gap-4 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Brain size={18} className="text-indigo-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">AI Coach</span>
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs text-slate-400">Live</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            {stats.avgScore >= 70 ? (
              <>
                <span className="text-slate-800 font-semibold">Great work — your avg score is {stats.avgScore}%!</span>{" "}
                Keep up the momentum.{" "}
              </>
            ) : stats.avgScore > 0 ? (
              <>
                <span className="text-slate-800 font-semibold">You're making progress — avg score is {stats.avgScore}%.</span>{" "}
                Focus on weak areas to push past 70%.{" "}
              </>
            ) : (
              <>
                <span className="text-slate-800 font-semibold">Ready to start your prep journey?</span>{" "}
                Complete your first mock interview to unlock insights.{" "}
              </>
            )}
            {insights?.recommendedSkills?.[0] && (
              <span>
                Priority skill today:{" "}
                <span className="text-indigo-600 font-medium">{insights.recommendedSkills[0]}</span>.
              </span>
            )}
          </p>
        </div>
        <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-xs text-slate-400">XP Progress</span>
          <span className="text-sm font-bold text-indigo-600">{totalXP.toLocaleString()} XP</span>
          <div className="w-28 h-1.5 bg-indigo-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-indigo-500 transition-all duration-700" style={{ width: `${xpPct}%` }} />
          </div>
        </div>
      </div>

      {/* ══ STAT CARDS ══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard
          label="Interviews Done"
          value={stats.totalInterviews ?? 0}
          sub={stats.totalInterviews > 0 ? "Completed sessions" : "Start your first!"}
          icon={BriefcaseIcon} iconBg="#eef2ff" iconColor="#6366f1"
        />
        <StatCard
          label="Avg Score"
          value={stats.avgScore ? `${stats.avgScore}%` : "—"}
          sub={stats.avgScore >= 70 ? "Above target 🎯" : stats.avgScore > 0 ? "Keep improving" : "No data yet"}
          subGood={stats.avgScore >= 70}
          icon={TrendingUp} iconBg="#ecfdf5" iconColor="#10b981"
        />
        <StatCard
          label="Assessments"
          value={stats.totalAssessments ?? 0}
          sub={stats.avgQuizScore ? `Avg quiz: ${stats.avgQuizScore}%` : "None yet"}
          subGood={stats.avgQuizScore >= 70}
          icon={FileText} iconBg="#fff7ed" iconColor="#f97316"
        />
        <StatCard
          label="Total XP"
          value={totalXP.toLocaleString()}
          sub={`Level ${maxLevel} · ${levelName(maxLevel)}`}
          progress={xpPct}
          progressColor="#6366f1"
          icon={Star} iconBg="#fef9c3" iconColor="#ca8a04"
        />
      </div>

      {/* ══ ROW: Trend + Radar ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

        <Card title="Performance Trend">
          {trend.length > 0 ? (
            <div className="h-[190px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="score" name="Score" stroke="#6366f1" strokeWidth={2.5}
                    dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[190px] flex flex-col items-center justify-center gap-2 text-slate-300">
              <BarChart2 size={32} />
              <span className="text-sm">Complete interviews to see trend</span>
            </div>
          )}
        </Card>

        <Card title="Interview Analytics">
          {radarData.some((d) => d.value > 0) ? (
            <div className="h-[190px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 10 }} />
                  <Radar name="Score" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.12} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[190px] flex flex-col items-center justify-center gap-2 text-slate-300">
              <Activity size={32} />
              <span className="text-sm">Analytics will appear after interviews</span>
            </div>
          )}
          {lastFeedback && (
            <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-600">Last feedback: </span>
                {lastFeedback}
              </p>
            </div>
          )}
        </Card>

      </div>

      {/* ══ ROW: Skills + Tasks + Leaderboard ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

        {/* Skills */}
        <Card title="Skill Progress">
          {skillBars.length > 0 ? (
            skillBars.map((s) => <SkillBar key={s.name} {...s} />)
          ) : (
            <div className="text-sm text-slate-400 text-center py-6">
              Add skills in your profile to track progress
            </div>
          )}
          {/* Assessment breakdown */}
          {breakdown.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Quiz Breakdown</div>
              {breakdown.map((b) => (
                <div key={b.category} className="flex items-center gap-2 mb-2 last:mb-0">
                  <span className="text-xs text-slate-500 w-24 truncate">{b.category}</span>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-400" style={{ width: `${b.avg}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-slate-500 w-8 text-right">{b.avg}%</span>
                </div>
              ))}
            </div>
          )}
          {/* roadmap progress summary */}
          {roadmaps.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Active Roadmaps</div>
              {roadmaps.map((r) => (
                <div key={r.skill} className="flex items-center gap-2 mb-2 last:mb-0">
                  <span className="text-xs text-slate-500 w-20 truncate">{r.skill}</span>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-violet-400" style={{ width: `${r.pct}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-slate-500 w-8 text-right">{r.pct}%</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Tasks */}
        <Card title="Today's Tasks" titleRight={
          <span className="text-xs font-semibold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-lg">
            {doneTasks}/{tasks.length}
          </span>
        }>
          <div className="space-y-0.5 mb-4">
            {tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group"
              >
                {task.done
                  ? <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                  : <Circle size={16} className="text-slate-300 flex-shrink-0 group-hover:text-slate-400 transition-colors" />
                }
                <span className={`text-sm ${task.done ? "line-through text-slate-300" : "text-slate-600"}`}>
                  {task.label}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
            <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${taskPct}%` }}
              />
            </div>
            <span className="text-xs text-slate-400">{taskPct}% done</span>
          </div>

          {/* Badges */}
          <div className="mt-5">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Badges</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: streak > 0 ? `${streak}-Day Streak` : "Start Streak", icon: Flame, color: "#f97316", bg: "#fff7ed" },
                { label: `Level ${maxLevel}`,                                   icon: Star,  color: "#ca8a04", bg: "#fef9c3" },
                { label: "Top Performer",                                       icon: Trophy,color: "#8b5cf6", bg: "#f5f3ff" },
                { label: "Consistent",                                          icon: Zap,   color: "#10b981", bg: "#ecfdf5" },
              ].map((b) => (
                <div key={b.label} className="flex items-center gap-2 border border-slate-100 rounded-xl p-2.5">
                  <b.icon size={12} style={{ color: b.color }} />
                  <span className="text-xs text-slate-500 font-medium">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Leaderboard */}
        <Card title="Leaderboard">
          <div className="flex gap-2 mb-4">
            {["weekly", "monthly"].map((t) => (
              <button
                key={t}
                onClick={() => setLbTab(t)}
                className={`text-xs px-3 py-1.5 rounded-xl capitalize font-medium transition-colors ${
                  lbTab === t
                    ? "bg-indigo-50 text-indigo-600 border border-indigo-200"
                    : "text-slate-400 hover:text-slate-600 border border-slate-100"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="space-y-1">
            {leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  entry.you
                    ? "bg-indigo-50 border border-indigo-100"
                    : "hover:bg-slate-50"
                }`}
              >
                <span className={`text-sm font-bold w-5 text-center ${
                  entry.rank === 1 ? "text-yellow-500" :
                  entry.rank === 2 ? "text-slate-400" :
                  entry.rank === 3 ? "text-amber-600" : "text-slate-300"
                }`}>
                  {entry.rank <= 3 ? ["🥇","🥈","🥉"][entry.rank - 1] : entry.rank}
                </span>
                <div className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: entry.color + "20", color: entry.color }}>
                  {entry.initials}
                </div>
                <span className={`flex-1 text-sm ${entry.you ? "text-indigo-700 font-bold" : "text-slate-600"}`}>
                  {entry.you ? `${dashboardData?.user?.name?.split(" ")[0] ?? "You"}` : entry.name}
                </span>
                <span className={`text-xs font-bold ${entry.you ? "text-indigo-500" : "text-slate-400"}`}>
                  {entry.pts.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </Card>

      </div>

      {/* ══ ROW: Salary + Insights ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

        <div className="lg:col-span-2">
          <Card title="Salary Benchmarks (₹K LPA)">
            {salaryData.length > 0 ? (
              <div className="h-[210px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salaryData} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="Min"    fill="#c7d2fe" radius={[3,3,0,0]} />
                    <Bar dataKey="Median" fill="#6366f1" radius={[3,3,0,0]} />
                    <Bar dataKey="Max"    fill="#3730a3" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[210px] flex flex-col items-center justify-center gap-2 text-slate-300">
                <BarChart2 size={32} />
                <span className="text-sm">Salary data loading…</span>
              </div>
            )}
            <div className="flex items-center gap-4 mt-3">
              {[["Min","#c7d2fe"],["Median","#6366f1"],["Max","#3730a3"]].map(([l,c]) => (
                <div key={l} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <div className="w-3 h-2.5 rounded-sm" style={{ background: c }} /> {l}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card title="AI Career Insights">
          {/* market outlook */}
          <div className="flex items-center gap-3 mb-4 p-3 rounded-xl border border-slate-100 bg-slate-50">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{
              background: getDemandBg(insights?.demandLevel)
            }}>
              <OutlookIcon size={15} style={{ color: getDemandColor(insights?.demandLevel) }} />
            </div>
            <div>
              <div className="text-xs text-slate-400">Market Outlook</div>
              <div className="text-sm font-bold" style={{ color: getDemandColor(insights?.demandLevel) }}>
                {insights?.marketOutlook ?? "—"}
              </div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-xs text-slate-400">Growth</div>
              <div className="text-sm font-bold text-slate-700">
                {insights?.growthRate != null ? `${insights.growthRate.toFixed(1)}%` : "—"}
              </div>
            </div>
          </div>

          {/* next actions */}
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Next Actions</div>
          <div className="space-y-1 mb-4">
            {(insights?.recommendedSkills ?? []).slice(0, 4).map((skill, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  i === 0 ? "bg-red-400" : i === 1 ? "bg-amber-400" : "bg-indigo-400"
                }`} />
                <span className="text-xs text-slate-500">Learn <span className="font-medium text-slate-700">{skill}</span></span>
              </div>
            ))}
          </div>

          <div className="text-xs text-slate-300 border-t border-slate-100 pt-3">
            Next update {nextUpdate}
          </div>
        </Card>

      </div>

      {/* ══ TOP SKILLS + RECOMMENDED ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card title="Top Industry Skills"
          titleRight={<span className="text-xs text-slate-400">Click to open roadmap</span>}>
          <div className="flex flex-wrap gap-2">
            {(insights?.topSkills ?? []).map((skill) => (
              <button
                key={skill}
                onClick={() => handleSkillClick(skill)}
                disabled={!!loadingSkill}
                className="flex items-center gap-1.5 text-xs bg-indigo-50 border border-indigo-100 text-indigo-600 px-3 py-1.5 rounded-xl hover:bg-indigo-100 transition-colors font-medium disabled:opacity-50"
              >
                {loadingSkill === skill ? (
                  <span className="w-3 h-3 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
                ) : (
                  <BookOpen size={11} />
                )}
                {loadingSkill === skill ? "Loading…" : skill}
              </button>
            ))}
          </div>
        </Card>

        <Card title="Recommended Skills">
          <div className="flex flex-wrap gap-2">
            {(insights?.recommendedSkills ?? []).map((skill) => (
              <button
                key={skill}
                onClick={() => handleSkillClick(skill)}
                disabled={!!loadingSkill}
                className="flex items-center gap-1.5 text-xs bg-violet-50 border border-violet-100 text-violet-600 px-3 py-1.5 rounded-xl hover:bg-violet-100 transition-colors font-medium disabled:opacity-50"
              >
                {loadingSkill === skill ? (
                  <span className="w-3 h-3 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
                ) : (
                  <Zap size={11} />
                )}
                {loadingSkill === skill ? "Loading…" : skill}
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* ══ KEY TRENDS ══ */}
      {(insights?.keyTrends ?? []).length > 0 && (
        <Card title="Industry Key Trends" className="mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {insights.keyTrends.map((trend, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <BarChart2 size={11} className="text-indigo-500" />
                </div>
                <span className="text-xs text-slate-500 leading-snug">{trend}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ══ ACTIVE ROADMAP ══ */}
      {activeRoadmap && (
        <Card title={`Roadmap — ${activeRoadmap.skill}`}
          titleRight={
            <span className="text-sm font-bold text-indigo-600">{roadmapProgress}% done</span>
          }
        >
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-5">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${roadmapProgress}%` }}
            />
          </div>
          <div className="space-y-2">
            {activeRoadmap.steps.map((step, i) => (
              <button
                key={step.id}
                onClick={() => handleToggle(step.id)}
                className="w-full flex items-start gap-4 p-3.5 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/40 transition-all text-left group"
              >
                <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
                  <span className="text-xs text-slate-300 w-4 text-right">{i + 1}</span>
                  {step.completed
                    ? <CheckCircle2 size={16} className="text-emerald-500" />
                    : <Circle size={16} className="text-slate-300 group-hover:text-slate-400 transition-colors" />
                  }
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-semibold mb-0.5 ${step.completed ? "line-through text-slate-300" : "text-slate-700"}`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-slate-400 leading-relaxed">{step.description}</div>
                </div>
                <ChevronRight size={14} className="text-slate-300 flex-shrink-0 mt-1 group-hover:text-slate-500 transition-colors" />
              </button>
            ))}
          </div>
        </Card>
      )}

    </div>
  );
}

/* helper used above */
function getOutlookIcon(outlook) {
  return outlook === "Positive" ? TrendingUp
    : outlook === "Negative" ? TrendingDown
    : Activity;
}