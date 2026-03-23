"use client";
// "use client";
// "use client";

// import React from "react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";

// import {
//   BriefcaseIcon,
//   LineChart,
//   TrendingUp,
//   TrendingDown,
//   Brain,
// } from "lucide-react";

// import { format, formatDistanceToNow } from "date-fns";

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";

// import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
// import { toggleSkillStep } from "@/actions/dashboard"
// import { saveSkillProgress } from "@/actions/dashboard";
// import { useRouter } from "next/navigation";

// import { generateSkillRoadmap } from "@/actions/dashboard";


// const DashboardView = ({ insights, skillProgress }) => {
//   const router = useRouter();
  

//   const [roadmap, setRoadmap] = React.useState(null);
//   const [loading, setLoading] = React.useState(false);

//   const handleSkillClick = async (skill) => {

//     try {

//       setLoading(true);

//       const data = await generateSkillRoadmap(skill);

//       await saveSkillProgress(skill);

//       setRoadmap(data);

//     } catch (error) {

//       console.error("Roadmap generation failed", error);

//     } finally {

//       setLoading(false);

//     }

//   };

//   const salaryData = insights.salaryRanges.map((range) => ({
//     name: range.role,
//     min: range.min / 1000,
//     max: range.max / 1000,
//     median: range.median / 1000,
//   }));

//   const getDemandLevelColor = (level) => {
//     switch (level.toLowerCase()) {
//       case "high":
//         return "bg-green-500";
//       case "medium":
//         return "bg-yellow-500";
//       case "low":
//         return "bg-red-500";
//       default:
//         return "bg-gray-500";
//     }
//   };

//   const getMarketOutlookInfo = (outlook) => {
//     switch (outlook.toLowerCase()) {
//       case "positive":
//         return { icon: TrendingUp, color: "text-green-500" };
//       case "neutral":
//         return { icon: LineChart, color: "text-yellow-500" };
//       case "negative":
//         return { icon: TrendingDown, color: "text-red-500" };
//       default:
//         return { icon: LineChart, color: "text-gray-500" };
//     }
//   };

//   const OutlookIcon = getMarketOutlookInfo(insights.marketOutlook).icon;
//   const outlookColor = getMarketOutlookInfo(insights.marketOutlook).color;

//   const lastUpdatedDate = format(new Date(insights.lastUpdated), "dd/MM/yyyy");

//   const nextUpdateDistance = formatDistanceToNow(
//     new Date(insights.nextUpdate),
//     { addSuffix: true }
//   );

//   return (
//     <div className="space-y-6">

//       {/* Last Updated */}
//       <div className="flex justify-between items-center">
//         <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0">
//           Last updated: {lastUpdatedDate}
//         </Badge>
//       </div>

//       {/* Market Overview */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">
//               Market Outlook
//             </CardTitle>
//             <OutlookIcon className={`h-4 w-4 ${outlookColor}`} />
//           </CardHeader>

//           <CardContent>
//             <div className="text-2xl font-bold">
//               {insights.marketOutlook}
//             </div>

//             <p className="text-xs text-muted-foreground">
//               Next update {nextUpdateDistance}
//             </p>
//           </CardContent>
//         </Card>


//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">
//               Industry Growth
//             </CardTitle>
//             <TrendingUp className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>

//           <CardContent>
//             <div className="text-2xl font-bold">
//               {insights.growthRate.toFixed(1)}%
//             </div>

//             <Progress value={insights.growthRate} className="mt-2" />
//           </CardContent>
//         </Card>


//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">
//               Demand Level
//             </CardTitle>

//             <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>

//           <CardContent>

//             <div className="text-2xl font-bold">
//               {insights.demandLevel}
//             </div>

//             <div
//               className={`h-2 w-full rounded-full mt-2 ${getDemandLevelColor(
//                 insights.demandLevel
//               )}`}
//             />

//           </CardContent>
//         </Card>


//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle>Top Skills (Click to generate roadmap)</CardTitle>

//             <Brain className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>

//           <CardContent>

//             <div className="flex flex-wrap gap-1">

//               {insights.topSkills.map((skill) => (
//                 <Badge
//                   key={skill}
//                   onClick={async () => {
//                     setLoading(true)
//                     const data = await generateSkillRoadmap(skill)
//                     setRoadmap(data)
//                     setLoading(false)
//                   }}>
//                   {skill}
//                 </Badge>
//               ))}

//           </div>

//         </CardContent>
//       </Card>

//     </div>


//       {/* Salary Chart */ }
//   <Card>
//     <CardHeader>

//       <CardTitle>Salary Ranges by Role</CardTitle>

//       <CardDescription>
//         Displaying minimum, median, and maximum salaries
//       </CardDescription>

//     </CardHeader>

//     <CardContent>

//       <div className="h-[400px]">

//         <ResponsiveContainer width="100%" height="100%">

//           <BarChart data={salaryData}>

//             <CartesianGrid strokeDasharray="3 3" />

//             <XAxis dataKey="name" />
//             <YAxis />

//             <Tooltip />

//             <Bar dataKey="min" fill="#a5b4fc" />
//             <Bar dataKey="median" fill="#818cf8" />
//             <Bar dataKey="max" fill="#6366f1" />

//           </BarChart>

//         </ResponsiveContainer>

//       </div>

//     </CardContent>
//   </Card>


//   {/* Industry Trends + Skills */ }

//   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


//     <Card>

//       <CardHeader>

//         <CardTitle>Key Industry Trends</CardTitle>

//         <CardDescription>
//           Current trends shaping the industry
//         </CardDescription>

//       </CardHeader>

//       <CardContent>

//         <ul className="space-y-4">

//           {insights.keyTrends.map((trend, index) => (

//             <li key={index} className="flex items-start space-x-2">

//               <div className="h-2 w-2 mt-2 rounded-full bg-primary" />

//               <span>{trend}</span>

//             </li>

//           ))}

//         </ul>

//       </CardContent>

//     </Card>


//     <Card>

//       <CardHeader>

//         <CardTitle>Recommended Skills</CardTitle>

//         <CardDescription>
//           Click a skill to generate AI roadmap
//         </CardDescription>

//       </CardHeader>

//       <CardContent>

//         <div className="flex flex-wrap gap-2">

//           {insights.recommendedSkills.map((skill) => (

//             <Badge
//               key={skill}
//               onClick={() => handleSkillClick(skill)}
//               className="cursor-pointer bg-indigo-100 text-indigo-700 border-indigo-200 px-3 py-1 rounded-full hover:bg-indigo-200 hover:scale-105 transition"
//             >
//               {skill}
//             </Badge>

//           ))}

//         </div>

//       </CardContent>

//     </Card>

//   </div>


//   {/* Loading */ }
//   {
//     loading && (
//       <p className="text-sm text-gray-500">
//         Generating AI roadmap...
//       </p>
//     )
//   }


//   {/* AI Roadmap */ }

//   {
//     roadmap && (

//       <Card>

//         <CardHeader>

//           <CardTitle>
//             {roadmap.skill} Roadmap
//           </CardTitle>

//           <CardDescription>
//             AI generated learning path
//           </CardDescription>

//         </CardHeader>

//         <CardContent>

//           <ul className="space-y-3">

//             {roadmap.steps.map((item, index) => (

//               <li
//                 key={index}
//                 className="p-3 border rounded-lg bg-white/70 hover:shadow-md transition"
//               >

//                 <div className="flex items-center gap-2">

//                   <input
//                     type="checkbox"
//                     className="h-4 w-4"
//                     onChange={() => toggleSkillStep(roadmap.skill, item.step)}
//                   />

//                   <p className="font-medium text-indigo-600">
//                     {item.step}
//                   </p>

//                 </div>

//                 <p className="text-sm text-gray-600">

//                   {item.description}

//                 </p>

//               </li>

//             ))}

//           </ul>

//         </CardContent>

//       </Card>

//     )
//   }
//   {/* Skill Progress Dashboard */ }

//   <Card className="mt-6">

//     <CardHeader>

//       <CardTitle>Your Learning Progress</CardTitle>

//       <CardDescription>
//         Track your skill development journey
//       </CardDescription>

//     </CardHeader>

//     <CardContent>

//       {skillProgress.length === 0 ? (

//         <p className="text-sm text-gray-500">
//           No skills started yet. Generate a roadmap to begin learning.
//         </p>

//       ) : (

//         <div className="space-y-4">

//           {skillProgress.map((skill) => (

//             <div
//               key={skill.id}
//               className="space-y-2 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition"
//               onClick={() => handleSkillClick(skill.skill)}
//             >

//               <div className="flex justify-between text-sm font-medium">

//                 <span>{skill.skill}</span>

//                 <span>{skill.progress}%</span>

//               </div>

//               <div className="w-full bg-gray-200 rounded-full h-2">

//                 <div
//                   className="bg-indigo-500 h-2 rounded-full transition-all"
//                   style={{ width: `${skill.progress}%` }}
//                 ></div>

//               </div>

//             </div>

//           ))}

//         </div>

//       )}

//     </CardContent>

//   </Card>

//     </div >


//   );
// };

// export default DashboardView;
"use client"

import React from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

import {
  BriefcaseIcon,
  LineChart,
  TrendingUp,
  TrendingDown,
  Brain,
} from "lucide-react"

import { format, formatDistanceToNow } from "date-fns"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

import { generateSkillRoadmap } from "@/actions/dashboard"
import { toggleRoadmapStep } from "@/actions/dashboard"

const DashboardView = ({ insights }) => {

  const [activeRoadmap, setActiveRoadmap] = React.useState(null)
  const [loadingSkill, setLoadingSkill] = React.useState(null)

  // ⭐ skill click handler
  const handleSkillClick = async (skill) => {
    try {
      setActiveRoadmap(null)
      setLoadingSkill(skill)

      const data = await generateSkillRoadmap(skill)
      setActiveRoadmap(data)

    } catch (e) {
      console.error(e)
    } finally {
      setLoadingSkill(null)
    }
  }

  // ⭐ toggle step
  const handleToggle = async (stepId) => {
    await toggleRoadmapStep(stepId)

    // optimistic UI update
    setActiveRoadmap(prev => ({
      ...prev,
      steps: prev.steps.map(s =>
        s.id === stepId
          ? { ...s, completed: !s.completed }
          : s
      )
    }))
  }

  // ⭐ progress calc
  const progress = activeRoadmap
    ? Math.round(
        (activeRoadmap.steps.filter(s => s.completed).length /
          activeRoadmap.steps.length) *
          100
      )
    : 0

  // ⭐ salary chart data
  const salaryData = insights.salaryRanges.map(r => ({
    name: r.role,
    min: r.min / 1000,
    median: r.median / 1000,
    max: r.max / 1000
  }))

  const getDemandColor = (level) => {
    if (level === "High") return "bg-green-500"
    if (level === "Medium") return "bg-yellow-500"
    return "bg-red-500"
  }

  const getOutlook = (outlook) => {
    if (outlook === "Positive") return { icon: TrendingUp, color: "text-green-500" }
    if (outlook === "Negative") return { icon: TrendingDown, color: "text-red-500" }
    return { icon: LineChart, color: "text-yellow-500" }
  }

  const OutlookIcon = getOutlook(insights.marketOutlook).icon
  const outlookColor = getOutlook(insights.marketOutlook).color

  const lastUpdated = format(new Date(insights.lastUpdated), "dd/MM/yyyy")
  const nextUpdate = formatDistanceToNow(new Date(insights.nextUpdate), { addSuffix: true })

  return (
    <div className="space-y-6">

      {/* ⭐ Header */}
      <div className="flex justify-between">
        <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
          Last Updated: {lastUpdated}
        </Badge>
      </div>

      {/* ⭐ Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        <Card>
          <CardHeader className="flex flex-row justify-between pb-2">
            <CardTitle className="text-sm">Market Outlook</CardTitle>
            <OutlookIcon className={`h-4 w-4 ${outlookColor}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.marketOutlook}</div>
            <p className="text-xs text-muted-foreground">
              Next update {nextUpdate}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between pb-2">
            <CardTitle className="text-sm">Industry Growth</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insights.growthRate.toFixed(1)}%
            </div>
            <Progress value={insights.growthRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between pb-2">
            <CardTitle className="text-sm">Demand Level</CardTitle>
            <BriefcaseIcon className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.demandLevel}</div>
            <div className={`h-2 mt-2 rounded ${getDemandColor(insights.demandLevel)}`} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Top Skills</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {insights.topSkills.map(skill => (
              <Badge
                key={skill}
                onClick={() => handleSkillClick(skill)}
                className="cursor-pointer bg-indigo-100 text-indigo-700"
              >
                {loadingSkill === skill ? "Loading..." : skill}
              </Badge>
            ))}
          </CardContent>
        </Card>

      </div>

      {/* ⭐ Salary Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Salary Trends</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer>
            <BarChart data={salaryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="min" fill="#a5b4fc" />
              <Bar dataKey="median" fill="#818cf8" />
              <Bar dataKey="max" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ⭐ Recommended Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Skills</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {insights.recommendedSkills.map(skill => (
            <Badge
              key={skill}
              onClick={() => handleSkillClick(skill)}
              className="cursor-pointer bg-purple-100 text-purple-700"
            >
              {loadingSkill === skill ? "Loading..." : skill}
            </Badge>
          ))}
        </CardContent>
      </Card>

      {/* ⭐ Active Roadmap */}
      {activeRoadmap && (
        <Card>
          <CardHeader>
            <CardTitle>
              Continue Learning — {activeRoadmap.skill}
            </CardTitle>
            <CardDescription>
              {progress}% Completed
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">

            <Progress value={progress} />

            <ul className="space-y-3">
              {activeRoadmap.steps.map(step => (
                <li key={step.id} className="p-3 border rounded-lg hover:bg-gray-50">

                  <div className="flex gap-2 items-center">
                    <input
                      type="checkbox"
                      checked={step.completed}
                      onChange={() => handleToggle(step.id)}
                    />
                    <span className="font-medium text-indigo-600">
                      {step.title}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mt-1">
                    {step.description}
                  </p>

                </li>
              ))}
            </ul>

          </CardContent>
        </Card>
      )}

    </div>
  )
}

export default DashboardView