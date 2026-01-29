"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Groq from "groq-sdk";
import { safeJsonParse } from "@/lib/safeJson";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* ----------------------------------
   QUIZ GENERATION
-----------------------------------*/
export async function generateQuiz() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      industry: true,
      skills: true,
    },
  });

  if (!user) throw new Error("User not found");

  const prompt = `
Generate 10 technical interview questions for a ${user.industry} professional${
    user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""
  }.

Rules:
- Each question must be MCQ with exactly 4 options
- Clearly mark correctAnswer (must match one option)
- Give short explanation
- Output STRICT JSON only
- Do NOT add any text outside JSON

JSON format:
{
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string",
      "explanation": "string"
    }
  ]
}
`;

  try {
    const res = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.5,
      max_tokens: 1200,
      messages: [
        { role: "system", content: "You are an expert technical interviewer." },
        { role: "user", content: prompt },
      ],
    });

    const rawText = res.choices[0].message.content;

    // 🔥 STEP 1: Extract ONLY JSON (Groq extra text hata deta hai)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("❌ No JSON found in AI response:", rawText);
      throw new Error("Invalid AI response format");
    }

    const cleanedText = jsonMatch[0];

    // 🔥 STEP 2: Parse CLEANED JSON ONLY
    const quiz = safeJsonParse(cleanedText);

    // 🔥 STEP 3: Final sanity check
    if (!quiz.questions || !Array.isArray(quiz.questions)) {
      throw new Error("Invalid quiz structure");
    }

    return quiz.questions;
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate quiz questions");
  }
}

/* ----------------------------------
   SAVE QUIZ RESULT + IMPROVEMENT TIP
-----------------------------------*/
export async function saveQuizResult(questions, answers, score) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const questionResults = questions.map((q, index) => ({
    question: q.question,
    answer: q.correctAnswer,
    userAnswer: answers[index],
    isCorrect: q.correctAnswer === answers[index],
    explanation: q.explanation,
  }));

  const wrongAnswers = questionResults.filter((q) => !q.isCorrect);

  let improvementTip = null;

  if (wrongAnswers.length > 0) {
    const wrongQuestionsText = wrongAnswers
      .map(
        (q) =>
          `Question: "${q.question}"
Correct Answer: "${q.answer}"
User Answer: "${q.userAnswer}"`
      )
      .join("\n\n");

    const improvementPrompt = `
The user got some ${user.industry} interview questions wrong.

${wrongQuestionsText}

Give ONE concise improvement tip:
- Focus on what to study/practice next
- Do NOT mention mistakes explicitly
- Max 2 sentences
- Encouraging tone
`;

    try {
      const tipRes = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        temperature: 0.4,
        max_tokens: 120,
        messages: [{ role: "user", content: improvementPrompt }],
      });

      improvementTip = tipRes.choices[0].message.content.trim();
    } catch (error) {
      console.error("Error generating improvement tip:", error);
    }
  }

  try {
    const assessment = await db.assessment.create({
      data: {
        userId: user.id,
        quizScore: score,
        questions: questionResults,
        category: "Technical",
        improvementTip,
      },
    });

    return assessment;
  } catch (error) {
    console.error("Error saving quiz result:", error);
    throw new Error("Failed to save quiz result");
  }
}

/* ----------------------------------
   GET ASSESSMENTS
-----------------------------------*/
export async function getAssessments() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    return await db.assessment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });
  } catch (error) {
    console.error("Error fetching assessments:", error);
    throw new Error("Failed to fetch assessments");
  }
}
