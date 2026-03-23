"use client";
// // import { getAssessments } from "@/actions/interview";
// import StatsCards from "./_components/stats-cards";
// import PerformanceChart from "./_components/performace-chart";
// import QuizList from "./_components/quiz-list";

// export default async function InterviewPrepPage() {
//   // const assessments = await getAssessments();

//   return (
//     <div>
//       <div className="flex items-center justify-between mb-5">
//         <h1 className="text-6xl font-bold gradient-title">
//           Interview Preparation
//         </h1>
//       </div>
//       <div className="space-y-6">
//         <StatsCards assessments={assessments} />
//         <PerformanceChart assessments={assessments} />
//         <QuizList assessments={assessments} />
//       </div>
//     </div>
//   );
// }


import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { startTimedInterview } from "@/actions/interview";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function InterviewStartPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  //////////////////////////////////////////////////////
  // ⭐ RESUME ACTIVE SESSION
  //////////////////////////////////////////////////////

  useEffect(() => {
    const checkActive = async () => {
      try {
        const res = await fetch("/api/interview/active");
        if (!res.ok) return;

        const session = await res.json();
        if (!session) return;

        router.push(`/interview/session/${session.id}`);
      } catch {
        console.log("resume check failed");
      }
    };

    checkActive();
  }, []);

  //////////////////////////////////////////////////////
  // ⭐ START NEW INTERVIEW
  //////////////////////////////////////////////////////

  const handleStart = async () => {
    try {
      setLoading(true);

      const session = await startTimedInterview("Frontend");

      router.push(`/interview/session/${session.id}`);
    } catch {
      toast.error("Failed to start interview");
    } finally {
      setLoading(false);
    }
  };

  //////////////////////////////////////////////////////

  return (
    <div className="flex justify-center mt-10">
      <Card className="w-[420px]">
        <CardHeader>
          <CardTitle className="text-2xl">
            AI Mock Interview
          </CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-muted-foreground">
            Experience a real timed technical interview.
            Answer descriptive questions and get AI evaluation.
          </p>
        </CardContent>

        <CardFooter>
          <Button
            onClick={handleStart}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Starting..." : "Start Interview"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}