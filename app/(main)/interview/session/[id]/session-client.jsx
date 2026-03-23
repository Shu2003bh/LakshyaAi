"use client";

import { useState, useEffect } from "react";
import { evaluateAnswer, finishInterview } from "@/actions/interview";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function InterviewSessionClient({ session }) {

  const router = useRouter();

  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [remaining, setRemaining] = useState(null);
  const [loading, setLoading] = useState(false);

  //////////////////////////////////////////////////////
  // TIMER
  //////////////////////////////////////////////////////

  useEffect(() => {

    const tick = () => {
      const end = new Date(session.endsAt).getTime();
      const sec = Math.floor((end - Date.now()) / 1000);

      if (sec <= 0) {
        autoFinish();
      } else {
        setRemaining(sec);
      }
    };

    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);

  }, []);

  //////////////////////////////////////////////////////
  // SUBMIT
  //////////////////////////////////////////////////////

  const submit = async () => {

    if (!answer.trim()) return;

    try {
      setLoading(true);

      const attempt = session.attempts[index];

      await evaluateAnswer(attempt.id, answer);

      setAnswer("");

      if (index < session.attempts.length - 1) {
        setIndex(i => i + 1);
      } else {
        autoFinish();
      }

    } finally {
      setLoading(false);
    }
  };

  //////////////////////////////////////////////////////
  // FINISH
  //////////////////////////////////////////////////////

  const autoFinish = async () => {
    await finishInterview(session.id);
    router.push(`/interview/result/${session.id}`);
  };

  //////////////////////////////////////////////////////

  const q = session.attempts[index];

  return (
    <div className="space-y-4">

      <div className="text-red-500 font-bold">
        Time Left: {remaining}s
      </div>

      <div className="font-semibold">
        Question {index + 1}/{session.attempts.length}
      </div>

      <div className="text-lg">
        {q.question.question}
      </div>

      <textarea
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        className="w-full border p-3 rounded"
      />

      <Button onClick={submit} disabled={loading}>
        {index < session.attempts.length - 1
          ? "Submit & Next"
          : "Finish Interview"}
      </Button>

    </div>
  );
}