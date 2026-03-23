"use client";
// "use client";

// import { Trophy, CheckCircle2, XCircle } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { CardContent, CardFooter } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";

// export default function QuizResult({
//   result,
//   hideStartNew = false,
//   onStartNew,
// }) {
//   if (!result) return null;

//   return (
//     <div className="mx-auto">
//       <h1 className="flex items-center gap-2 text-3xl gradient-title">
//         <Trophy className="h-6 w-6 text-yellow-500" />
//         Quiz Results
//       </h1>

//       <CardContent className="space-y-6">
//         {/* Score Overview */}
//         <div className="text-center space-y-2">
//           <h3 className="text-2xl font-bold">{result.quizScore.toFixed(1)}%</h3>
//           <Progress value={result.quizScore} className="w-full" />
//         </div>

//         {/* Improvement Tip */}
//         {result.improvementTip && (
//           <div className="bg-muted p-4 rounded-lg">
//             <p className="font-medium">Improvement Tip:</p>
//             <p className="text-muted-foreground">{result.improvementTip}</p>
//           </div>
//         )}

//         {/* Questions Review */}
//         <div className="space-y-4">
//           <h3 className="font-medium">Question Review</h3>
//           {result.questions.map((q, index) => (
//             <div key={index} className="border rounded-lg p-4 space-y-2">
//               <div className="flex items-start justify-between gap-2">
//                 <p className="font-medium">{q.question}</p>
//                 {q.isCorrect ? (
//                   <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
//                 ) : (
//                   <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
//                 )}
//               </div>
//               <div className="text-sm text-muted-foreground">
//                 <p>Your answer: {q.userAnswer}</p>
//                 {!q.isCorrect && <p>Correct answer: {q.answer}</p>}
//               </div>
//               <div className="text-sm bg-muted p-2 rounded">
//                 <p className="font-medium">Explanation:</p>
//                 <p>{q.explanation}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </CardContent>

//       {!hideStartNew && (
//         <CardFooter>
//           <Button onClick={onStartNew} className="w-full">
//             Start New Quiz
//           </Button>
//         </CardFooter>
//       )}
//     </div>
//   );
// }


// "use client";

"use client";

import { Trophy, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function QuizResult({
  result,
  hideStartNew = false,
  onStartNew,
}) {
  if (!result) return null;

  const score = result.quizScore;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-10">

      {/* ⭐ TITLE */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-yellow-100">
          <Trophy className="h-6 w-6 text-yellow-600" />
        </div>
        <h1 className="text-2xl font-bold">
          Quiz Result
        </h1>
      </div>

      {/* ⭐ SCORE SECTION */}
      <div className="space-y-4">
        <div className="text-5xl font-bold">
          {score.toFixed(1)}%
        </div>

        <Progress
          value={score}
          className="h-2"
        />
      </div>

      {/* ⭐ IMPROVEMENT TIP */}
      {result.improvementTip && (
        <div className="bg-gray-50 border rounded-lg p-4">
          <p className="font-semibold mb-1">
            Improvement Suggestion
          </p>
          <p className="text-sm text-gray-600">
            {result.improvementTip}
          </p>
        </div>
      )}

      {/* ⭐ QUESTIONS */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">
          Question Review
        </h2>

        {result.questions.map((q, i) => (
          <div
            key={i}
            className="border-b pb-5 space-y-3"
          >
            <div className="flex justify-between gap-3">
              <p className="font-medium">
                {i + 1}. {q.question}
              </p>

              {q.isCorrect ? (
                <CheckCircle2 className="text-green-500 w-5 h-5 shrink-0" />
              ) : (
                <XCircle className="text-red-500 w-5 h-5 shrink-0" />
              )}
            </div>

            <p className="text-sm text-gray-600">
              <span className="font-medium text-black">
                Your answer:
              </span>{" "}
              {q.userAnswer}
            </p>

            {!q.isCorrect && (
              <p className="text-sm text-gray-600">
                <span className="font-medium text-black">
                  Correct answer:
                </span>{" "}
                {q.answer}
              </p>
            )}

            <div className="bg-gray-100 rounded p-3 text-sm text-gray-700">
              <span className="font-medium">Explanation: </span>
              {q.explanation}
            </div>
          </div>
        ))}
      </div>

      {/* ⭐ BUTTON */}
      {!hideStartNew && (
        <Button
          onClick={onStartNew}
          className="w-full h-11"
        >
          Start New Quiz
        </Button>
      )}
    </div>
  );
}