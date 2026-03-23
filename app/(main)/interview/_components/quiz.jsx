"use client";
// "use client";

// import { useState, useEffect } from "react";
// import { toast } from "sonner";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Label } from "@/components/ui/label";
// import { generateQuiz, saveQuizResult } from "@/actions/interview";
// import QuizResult from "./quiz-result";
// import useFetch from "@/hooks/use-fetch";
// import { BarLoader } from "react-spinners";

// export default function Quiz() {
//   const [currentQuestion, setCurrentQuestion] = useState(0);
//   const [answers, setAnswers] = useState([]);
//   const [showExplanation, setShowExplanation] = useState(false);

//   const {
//     loading: generatingQuiz,
//     fn: generateQuizFn,
//     data: quizData,
//   } = useFetch(generateQuiz);

//   const {
//     loading: savingResult,
//     fn: saveQuizResultFn,
//     data: resultData,
//     setData: setResultData,
//   } = useFetch(saveQuizResult);

//   useEffect(() => {
//     if (quizData) {
//       setAnswers(new Array(quizData.length).fill(null));
//     }
//   }, [quizData]);

//   const handleAnswer = (answer) => {
//     const newAnswers = [...answers];
//     newAnswers[currentQuestion] = answer;
//     setAnswers(newAnswers);
//   };

//   const handleNext = () => {
//     if (currentQuestion < quizData.length - 1) {
//       setCurrentQuestion(currentQuestion + 1);
//       setShowExplanation(false);
//     } else {
//       finishQuiz();
//     }
//   };

//   const calculateScore = () => {
//     let correct = 0;
//     answers.forEach((answer, index) => {
//       if (answer === quizData[index].correctAnswer) {
//         correct++;
//       }
//     });
//     return (correct / quizData.length) * 100;
//   };

//   const finishQuiz = async () => {
//     const score = calculateScore();
//     try {
//       await saveQuizResultFn(quizData, answers, score);
//       toast.success("Quiz completed!");
//     } catch (error) {
//       toast.error(error.message || "Failed to save quiz results");
//     }
//   };

//   const startNewQuiz = () => {
//     setCurrentQuestion(0);
//     setAnswers([]);
//     setShowExplanation(false);
//     generateQuizFn();
//     setResultData(null);
//   };

//   if (generatingQuiz) {
//     return <BarLoader className="mt-4" width={"100%"} color="gray" />;
//   }

//   // Show results if quiz is completed
//   if (resultData) {
//     return (
//       <div className="mx-2">
//         <QuizResult result={resultData} onStartNew={startNewQuiz} />
//       </div>
//     );
//   }

//   if (!quizData) {
//     return (
//       <Card className="mx-2">
//         <CardHeader>
//           <CardTitle>Ready to test your knowledge?</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <p className="text-muted-foreground">
//             This quiz contains 10 questions specific to your industry and
//             skills. Take your time and choose the best answer for each question.
//           </p>
//         </CardContent>
//         <CardFooter>
//           <Button onClick={generateQuizFn} className="w-full">
//             Start Quiz
//           </Button>
//         </CardFooter>
//       </Card>
//     );
//   }

//   const question = quizData[currentQuestion];

//   return (
//     <Card className="mx-2">
//       <CardHeader>
//         <CardTitle>
//           Question {currentQuestion + 1} of {quizData.length}
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         <p className="text-lg font-medium">{question.question}</p>
//         <RadioGroup
//           onValueChange={handleAnswer}
//           value={answers[currentQuestion]}
//           className="space-y-2"
//         >
//           {question.options.map((option, index) => (
//             <div key={index} className="flex items-center space-x-2">
//               <RadioGroupItem value={option} id={`option-${index}`} />
//               <Label htmlFor={`option-${index}`}>{option}</Label>
//             </div>
//           ))}
//         </RadioGroup>

//         {showExplanation && (
//           <div className="mt-4 p-4 bg-muted rounded-lg">
//             <p className="font-medium">Explanation:</p>
//             <p className="text-muted-foreground">{question.explanation}</p>
//           </div>
//         )}
//       </CardContent>
//       <CardFooter className="flex justify-between">
//         {!showExplanation && (
//           <Button
//             onClick={() => setShowExplanation(true)}
//             variant="outline"
//             disabled={!answers[currentQuestion]}
//           >
//             Show Explanation
//           </Button>
//         )}
//         <Button
//           onClick={handleNext}
//           disabled={!answers[currentQuestion] || savingResult}
//           className="ml-auto"
//         >
//           {savingResult && (
//             <BarLoader className="mt-4" width={"100%"} color="gray" />
//           )}
//           {currentQuestion < quizData.length - 1
//             ? "Next Question"
//             : "Finish Quiz"}
//         </Button>
//       </CardFooter>
//     </Card>
//   );
// }

"use client";
import { useRouter } from "next/navigation";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarLoader } from "react-spinners";
import { toast } from "sonner";

import {
  startTimedInterview,
  evaluateAnswer,
  finishInterview,
} from "@/actions/interview";
// import { useRouter } from "next/navigation";

export default function InterviewSimulator({ role = "Frontend" }) {

  const [session, setSession] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [remaining, setRemaining] = useState(null);
  const [loading, setLoading] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const router = useRouter();

//////////////////////////////////////////////////////
// ⭐ RESUME SESSION EFFECT (FIRST)
//////////////////////////////////////////////////////

useEffect(() => {

  const checkActiveSession = async () => {

    try {

      const res = await fetch("/api/interview/active");
      if (!res.ok) return;

      const data = await res.json();
      if (!data) return;

      if (data.status === "completed") {
        router.push(`/interview/result/${data.id}`);
        return;
      }

      const end = new Date(data.endsAt).getTime();

      if (Date.now() > end) {
        await finishInterview(data.id);
        router.push(`/interview/result/${data.id}`);
        return;
      }

      setSession(data);
      setRemaining(Math.floor((end - Date.now()) / 1000));

    } catch {
      console.log("resume failed");
    }
  };

  checkActiveSession();

}, []);
  

  ////////////////////////////////////////////////////////
  // ⭐ START INTERVIEW
  ////////////////////////////////////////////////////////

  const handleStart = async () => {
    try {
      setLoading(true);
      const s = await startTimedInterview(role);
      setSession(s);

      const end = new Date(s.endsAt).getTime();
      setRemaining(Math.floor((end - Date.now()) / 1000));

    } catch (e) {
      toast.error("Failed to start interview");
    } finally {
      setLoading(false);
    }
  };

  ////////////////////////////////////////////////////////
  // ⭐ TIMER
  ////////////////////////////////////////////////////////

  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      const end = new Date(session.endsAt).getTime();
      const sec = Math.floor((end - Date.now()) / 1000);

      if (sec <= 0) {
        clearInterval(interval);
        autoFinish();
      } else {
        setRemaining(sec);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  ////////////////////////////////////////////////////////
  // ⭐ SUBMIT ANSWER
  ////////////////////////////////////////////////////////

  const submitAnswer = async () => {

    if (!answer.trim()) return;

    try {
      setLoading(true);

      const attempt = session.attempts[current];

      await evaluateAnswer(attempt.id, answer);

      setAnswer("");

      if (current < session.attempts.length - 1) {
        setCurrent((c) => c + 1);
      } else {
        autoFinish();
      }

    } catch {
      toast.error("Evaluation failed");
    } finally {
      setLoading(false);
    }
  };

 

router.push(`/interview/result/${session.id}`);

  ////////////////////////////////////////////////////////
  // ⭐ AUTO FINISH
  ////////////////////////////////////////////////////////

  const autoFinish = async () => {
    try {
      setFinishing(true);
      await finishInterview(session.id);
      toast.success("Interview Completed");
     router.push(`/interview/result/${session.id}`); // later → route to result page
    } catch {
      toast.error("Failed finishing interview");
    }
  };

  ////////////////////////////////////////////////////////
  // ⭐ FORMAT TIMER
  ////////////////////////////////////////////////////////

  const format = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  ////////////////////////////////////////////////////////
  // ⭐ START SCREEN
  ////////////////////////////////////////////////////////

  if (!session) {
    return (
      <Card className="mx-2">
        <CardHeader>
          <CardTitle>Mock Interview Simulator</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Realistic timed technical interview. Answer descriptive questions.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleStart} disabled={loading} className="w-full">
            {loading ? "Starting..." : "Start Interview"}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  ////////////////////////////////////////////////////////
  // ⭐ MAIN INTERVIEW UI
  ////////////////////////////////////////////////////////

  const attempt = session.attempts[current];
  const question = attempt.question;

  return (
    <Card className="mx-2">

      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>
          Question {current + 1} / {session.attempts.length}
        </CardTitle>

        <div className="text-red-500 font-bold text-lg">
          {remaining !== null ? format(remaining) : "--:--"}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">

        <p className="text-lg font-medium">{question.question}</p>

        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer..."
          className="w-full border rounded-lg p-3 min-h-[150px]"
        />

        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full"
            style={{
              width: `${((current + 1) / session.attempts.length) * 100}%`,
            }}
          />
        </div>

      </CardContent>

      <CardFooter>
        <Button
          onClick={submitAnswer}
          disabled={loading}
          className="ml-auto"
        >
          {loading
            ? "Evaluating..."
            : current < session.attempts.length - 1
            ? "Submit & Next"
            : "Finish Interview"}
        </Button>
      </CardFooter>

      {finishing && (
        <BarLoader width={"100%"} color="gray" />
      )}

    </Card>
  );
}