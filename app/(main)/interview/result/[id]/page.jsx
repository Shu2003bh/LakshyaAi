import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

export default async function InterviewResultPage(props) {

  // ⭐ VERY IMPORTANT FIX
  const { id } = await props.params;

  const session = await db.interviewSession.findUnique({
    where: { id },
    include: {
      attempts: {
        include: { question: true },
      },
    },
  });

  if (!session) return notFound();

  const score = Math.round(session.totalScore || 0);

  ////////////////////////////////////////////////////
  // ⭐ READINESS BAND
  ////////////////////////////////////////////////////

  let band = "Not Ready";
  let color = "text-red-500";

  if (score >= 80) {
    band = "Placement Ready";
    color = "text-green-500";
  } else if (score >= 60) {
    band = "Interview Capable";
    color = "text-yellow-500";
  } else if (score >= 40) {
    band = "Needs Practice";
    color = "text-orange-500";
  }

  ////////////////////////////////////////////////////

  return (
    <div className="space-y-6">

     <Card className="shadow-lg rounded-2xl border">
        <CardHeader>
          <CardTitle>Interview Result</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          <div className="text-4xl font-bold">
            {score}%
          </div>

          <div className={`text-xl font-semibold ${color}`}>
            {band}
          </div>

        </CardContent>
      </Card>

      <Card className="shadow-lg rounded-2xl border">
        <CardHeader>
          <CardTitle>Question Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          {session.attempts.map((a, i) => (
            <div key={a.id} className="border rounded-lg p-4 space-y-2">

              <div className="font-semibold">
                Q{i + 1}. {a.question.question}
              </div>

             <div className="bg-gray-100 p-3 rounded-lg">
                Your Answer:
              </div>

              <div className="bg-gray-300 p-3 rounded">
                {a.userAnswer || "Not Attempted"}
              </div>

              <div className="text-sm text-muted-foreground">
                AI Feedback:
              </div>

              <div className="p-3 border rounded">
                {a.feedback}
              </div>

              <div className="font-medium">
                Score: {a.score ?? 0}
              </div>

            </div>
          ))}

        </CardContent>
      </Card>

    </div>
  );
}