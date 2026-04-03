"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Groq from "groq-sdk";
import { safeJsonParse } from "@/lib/safeJson";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

//////////////////////////////////////////////////////
// ✅ ROLE-BASED MCQ QUESTION GENERATOR
//////////////////////////////////////////////////////

export async function getQuestions(role, difficulty = "Mixed", category = "Technical") {
  // Step 1: Try fetching from DB
  const whereClause = { role };
  if (difficulty !== "Mixed") whereClause.difficulty = difficulty;
  if (category !== "All") whereClause.category = category;

  let questions = await db.interviewQuestion.findMany({
    where: whereClause,
    take: 10,
    orderBy: { createdAt: "desc" },
  });

  if (questions.length >= 10) return questions.slice(0, 10);

  // Step 2: AI fallback — generate professional role-specific MCQs
  const remaining = 10 - questions.length;
  const difficultyInstruction = difficulty === "Mixed"
    ? "Mix of Easy, Medium, and Hard questions"
    : `All questions should be ${difficulty} difficulty`;

  const prompt = `
You are a senior technical interviewer at a top tech company.
Generate ${remaining} professional MCQ interview questions for the role: "${role}".
Category: ${category}
Difficulty: ${difficultyInstruction}

Rules:
- Questions must be realistic, industry-standard interview questions
- Each question must have exactly 4 options labeled A, B, C, D
- The correctAnswer must be one of: "A", "B", "C", "D"
- Include a brief but clear explanation (1-2 sentences)
- Assign difficulty: "Easy", "Medium", or "Hard"
- Assign category: one of "Technical", "DSA", "System Design", "HR", "Behavioral"
- Return ONLY valid JSON, no markdown, no extra text

JSON format:
[
  {
    "question": "What is the time complexity of binary search?",
    "options": ["A. O(n)", "B. O(log n)", "C. O(n²)", "D. O(1)"],
    "correctAnswer": "B",
    "explanation": "Binary search halves the search space at each step, giving O(log n) time complexity.",
    "difficulty": "Easy",
    "category": "DSA"
  }
]
`;

  try {
    const res = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.5,
      max_tokens: 3000,
      messages: [
        {
          role: "system",
          content: "You are an expert technical interviewer at Google/Amazon. Return only valid JSON arrays. No markdown.",
        },
        { role: "user", content: prompt },
      ],
    });

    const rawText = res.choices[0].message.content;
    const parsed = safeJsonParse(rawText);

    if (Array.isArray(parsed) && parsed.length > 0) {
      await db.interviewQuestion.createMany({
        data: parsed.map((q) => ({
          role,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || null,
          difficulty: q.difficulty || "Medium",
          category: q.category || category,
        })),
      });
    }
  } catch (error) {
    console.error("Error generating questions:", error);
  }

  // Re-fetch
  return db.interviewQuestion.findMany({
    where: whereClause,
    take: 10,
    orderBy: { createdAt: "desc" },
  });
}

//////////////////////////////////////////////////////
// ✅ START TIMED INTERVIEW
//////////////////////////////////////////////////////

export async function startTimedInterview(role, difficulty = "Mixed", category = "Technical") {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  const questions = await getQuestions(role, difficulty, category);

  const start = new Date();
  const durationSec = 1200; // 20 minutes
  const end = new Date(start.getTime() + durationSec * 1000);

  return db.interviewSession.create({
    data: {
      userId: user.id,
      role,
      status: "active",
      duration: durationSec,
      startedAt: start,
      endsAt: end,
      attempts: {
        create: questions.map((q) => ({
          questionId: q.id,
        })),
      },
    },
    include: {
      attempts: { include: { question: true } },
    },
  });
}

//////////////////////////////////////////////////////
// ✅ SUBMIT ANSWER (MCQ LOGIC)
//////////////////////////////////////////////////////

export async function submitAnswer(attemptId, answer) {
  const attempt = await db.interviewAttempt.findUnique({
    where: { id: attemptId },
    include: { question: true },
  });

  if (!attempt) throw new Error("Attempt not found");

  const isCorrect = answer === attempt.question.correctAnswer;

  return db.interviewAttempt.update({
    where: { id: attemptId },
    data: {
      userAnswer: answer,
      isCorrect,
      score: isCorrect ? 10 : 0,
    },
  });
}

//////////////////////////////////////////////////////
// ✅ FINISH INTERVIEW + XP UPDATE
//////////////////////////////////////////////////////

export async function finishInterview(sessionId) {
  const session = await db.interviewSession.findUnique({
    where: { id: sessionId },
    include: { attempts: true },
  });

  if (!session) throw new Error("Session not found");

  const correct = session.attempts.filter((a) => a.isCorrect).length;
  const total = session.attempts.length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  // Update SkillXP with actual role
  const skillName = session.role || "General";

  await db.skillXP.upsert({
    where: {
      userId_skill: {
        userId: session.userId,
        skill: skillName,
      },
    },
    update: {
      xp: { increment: accuracy },
      streak: { increment: 1 },
      level: accuracy >= 80 ? { increment: 1 } : undefined,
    },
    create: {
      userId: session.userId,
      skill: skillName,
      xp: accuracy,
      level: 1,
      streak: 1,
    },
  });

  return db.interviewSession.update({
    where: { id: sessionId },
    data: {
      status: "completed",
      totalScore: accuracy,
      completedAt: new Date(),
    },
  });
}

//////////////////////////////////////////////////////
// ✅ GET INTERVIEW HISTORY
//////////////////////////////////////////////////////

export async function getInterviewHistory() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  return db.interviewSession.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      attempts: {
        include: { question: true },
      },
    },
  });
}

//////////////////////////////////////////////////////
// ✅ GET SESSION BY ID
//////////////////////////////////////////////////////

export async function getSessionById(sessionId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  const session = await db.interviewSession.findUnique({
    where: { id: sessionId },
    include: {
      attempts: {
        include: { question: true },
      },
    },
  });

  if (!session || session.userId !== user.id) {
    throw new Error("Session not found");
  }

  return session;
}