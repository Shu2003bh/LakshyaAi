// "use server";

// import { db } from "@/lib/prisma";
// import { auth } from "@clerk/nextjs/server";
// import Groq from "groq-sdk";
// import { safeJsonParse } from "@/lib/safeJson";

// const groq = new Groq({
//   apiKey: process.env.GROQ_API_KEY,
// });

// /* ----------------------------------
//    QUIZ GENERATION
// -----------------------------------*/
// export async function generateQuiz() {
//   const { userId } = await auth();
//   if (!userId) throw new Error("Unauthorized");

//   const user = await db.user.findUnique({
//     where: { clerkUserId: userId },
//     select: {
//       industry: true,
//       skills: true,
//     },
//   });

//   if (!user) throw new Error("User not found");

//   const prompt = `
// Generate 10 technical interview questions for a ${user.industry} professional${
//     user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""
//   }.

// Rules:
// - Each question must be MCQ with exactly 4 options
// - Clearly mark correctAnswer (must match one option)
// - Give short explanation
// - Output STRICT JSON only
// - Do NOT add any text outside JSON

// JSON format:
// {
//   "questions": [
//     {
//       "question": "string",
//       "options": ["string", "string", "string", "string"],
//       "correctAnswer": "string",
//       "explanation": "string"
//     }
//   ]
// }
// `;

//   try {
//     const res = await groq.chat.completions.create({
//       model: "llama-3.1-8b-instant",
//       temperature: 0.5,
//       max_tokens: 1200,
//       messages: [
//         { role: "system", content: "You are an expert technical interviewer." },
//         { role: "user", content: prompt },
//       ],
//     });

//     const rawText = res.choices[0].message.content;

//     // 🔥 STEP 1: Extract ONLY JSON (Groq extra text hata deta hai)
//     const jsonMatch = rawText.match(/\{[\s\S]*\}/);
//     if (!jsonMatch) {
//       console.error("❌ No JSON found in AI response:", rawText);
//       throw new Error("Invalid AI response format");
//     }

//     const cleanedText = jsonMatch[0];

//     // 🔥 STEP 2: Parse CLEANED JSON ONLY
//     const quiz = safeJsonParse(cleanedText);

//     // 🔥 STEP 3: Final sanity check
//     if (!quiz.questions || !Array.isArray(quiz.questions)) {
//       throw new Error("Invalid quiz structure");
//     }

//     return quiz.questions;
//   } catch (error) {
//     console.error("Error generating quiz:", error);
//     throw new Error("Failed to generate quiz questions");
//   }
// }

// /* ----------------------------------
//    SAVE QUIZ RESULT + IMPROVEMENT TIP
// -----------------------------------*/
// export async function saveQuizResult(questions, answers, score) {
//   const { userId } = await auth();
//   if (!userId) throw new Error("Unauthorized");

//   const user = await db.user.findUnique({
//     where: { clerkUserId: userId },
//   });

//   if (!user) throw new Error("User not found");

//   const questionResults = questions.map((q, index) => ({
//     question: q.question,
//     answer: q.correctAnswer,
//     userAnswer: answers[index],
//     isCorrect: q.correctAnswer === answers[index],
//     explanation: q.explanation,
//   }));

//   const wrongAnswers = questionResults.filter((q) => !q.isCorrect);

//   let improvementTip = null;

//   if (wrongAnswers.length > 0) {
//     const wrongQuestionsText = wrongAnswers
//       .map(
//         (q) =>
//           `Question: "${q.question}"
// Correct Answer: "${q.answer}"
// User Answer: "${q.userAnswer}"`
//       )
//       .join("\n\n");

//     const improvementPrompt = `
// The user got some ${user.industry} interview questions wrong.

// ${wrongQuestionsText}

// Give ONE concise improvement tip:
// - Focus on what to study/practice next
// - Do NOT mention mistakes explicitly
// - Max 2 sentences
// - Encouraging tone
// `;

//     try {
//       const tipRes = await groq.chat.completions.create({
//         model: "llama-3.1-8b-instant",
//         temperature: 0.4,
//         max_tokens: 120,
//         messages: [{ role: "user", content: improvementPrompt }],
//       });

//       improvementTip = tipRes.choices[0].message.content.trim();
//     } catch (error) {
//       console.error("Error generating improvement tip:", error);
//     }
//   }

//   try {
//     const assessment = await db.assessment.create({
//       data: {
//         userId: user.id,
//         quizScore: score,
//         questions: questionResults,
//         category: "Technical",
//         improvementTip,
//       },
//     });

//     return assessment;
//   } catch (error) {
//     console.error("Error saving quiz result:", error);
//     throw new Error("Failed to save quiz result");
//   }
// }

// /* ----------------------------------
//    GET ASSESSMENTS
// -----------------------------------*/
// export async function getAssessments() {
//   const { userId } = await auth();
//   if (!userId) throw new Error("Unauthorized");

//   const user = await db.user.findUnique({
//     where: { clerkUserId: userId },
//   });

//   if (!user) throw new Error("User not found");

//   try {
//     return await db.assessment.findMany({
//       where: { userId: user.id },
//       orderBy: { createdAt: "asc" },
//     });
//   } catch (error) {
//     console.error("Error fetching assessments:", error);
//     throw new Error("Failed to fetch assessments");
//   }
// }
// export async function getHybridQuestions(role) {

//   // ⭐ STEP 1 → fetch DB questions
//   const dbQuestions = await db.$queryRaw`
//  SELECT * FROM "InterviewQuestion"
//  WHERE role = ${role}
//  ORDER BY RANDOM()
//  LIMIT 8
// `

//   // ⭐ STEP 2 → if enough → return
//   if (dbQuestions.length >= 8) return dbQuestions

//   // ⭐ STEP 3 → AI fallback
//   const remaining = 8 - dbQuestions.length

//   const prompt = `
// Generate ${remaining} real interview questions for Fresher ${role}.
// Return JSON array:
// [{ "question":"text" }]
// `

//   const res = await groq.chat.completions.create({
//     model: "llama-3.1-8b-instant",
//     messages: [
//       { role: "system", content: "You are interview question generator." },
//       { role: "user", content: prompt }
//     ]
//   })

//   let aiQuestions = []

//   try {
//     aiQuestions = JSON.parse(res.choices[0].message.content)
//   } catch {
//     aiQuestions = []
//   }

//   // ⭐ convert to DB-like format
//  const createdAI = await db.interviewQuestion.createMany({
//   data: aiQuestions.map(q => ({
//     role,
//     question: q.question,
//     type: "Technical",
//     difficulty: "Medium",
//     tags: []
//   }))
// })

// const newQuestions = await db.interviewQuestion.findMany({
//   where: { role },
//   orderBy: { createdAt: "desc" },
//   take: remaining
// })

// return [...dbQuestions, ...newQuestions]
// }


// export async function startTimedInterview(role) {

//   const { userId } = await auth()
//   if (!userId) throw new Error("Unauthorized")

//   const user = await db.user.findUnique({
//     where: { clerkUserId: userId }
//   })

//   // ⭐ get hybrid questions
//   const questions = await getHybridQuestions(role)

//   // ⭐ create session transaction
//   const session = await db.$transaction(async tx => {

//     const created = await tx.interviewSession.create({
//       data: {
//         userId: user.id,
//         role,
//         duration: 1200,
//         startedAt: new Date(),
//         attempts: {
//           create: questions.map(q => ({
//             questionId: q.id
//           }))
//         }
//       },
//       include: {
//         attempts: {
//           include: { question: true }
//         }
//       }
//     })

//     return created
//   })

//   return session
// }

// export async function evaluateAnswer(attemptId, answer) {

//   const attempt = await db.interviewAttempt.findUnique({
//     where: { id: attemptId },
//     include: { question: true }
//   })

//   const prompt = `
// Question: ${attempt.question.question}

// Answer: ${answer}

// Evaluate on:
// - clarity
// - correctness
// - depth

// Return JSON:
// { "score": number, "feedback":"text" }
// `

//   const res = await groq.chat.completions.create({
//     model: "llama-3.1-8b-instant",
//     messages: [
//       { role: "system", content: "You are interviewer." },
//       { role: "user", content: prompt }
//     ]
//   })

//   const parsed = safeJsonParse(res.choices[0].message.content)

//   return db.interviewAttempt.update({
//     where: { id: attemptId },
//     data: {
//       userAnswer: answer,
//       score: parsed.score,
//       feedback: parsed.feedback
//     }
//   })
// }


"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Groq from "groq-sdk";
import { safeJsonParse } from "@/lib/safeJson";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

//////////////////////////////////////////////////////
// ⭐ HYBRID QUESTION ENGINE
//////////////////////////////////////////////////////

export async function getHybridQuestions(role) {

  let dbQuestions = await db.$queryRaw`
    SELECT * FROM "InterviewQuestion"
    WHERE role = ${role}
    ORDER BY RANDOM()
    LIMIT 8
  `;

  if (dbQuestions.length >= 8) return dbQuestions;

  const remaining = 8 - dbQuestions.length;

  const prompt = `
Generate ${remaining} realistic technical interview questions 
for a Fresher ${role} developer.

Return ONLY valid JSON array, no markdown:
[{ "question": "text" }]
`;

  const res = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    temperature: 0.5,
    messages: [
      { role: "system", content: "You are a senior tech interviewer. Return only JSON." },
      { role: "user", content: prompt },
    ],
  });

  const parsed = safeJsonParse(res.choices[0].message.content);
  const aiQuestions = Array.isArray(parsed) ? parsed : [];

  if (aiQuestions.length) {
    await db.interviewQuestion.createMany({
      data: aiQuestions.map((q) => ({
        role,
        question: q.question,
        type: "Technical",
        difficulty: "Medium",
        tags: [],
      })),
    });
  }

  return db.$queryRaw`
    SELECT * FROM "InterviewQuestion"
    WHERE role = ${role}
    ORDER BY RANDOM()
    LIMIT 8
  `;
}

//////////////////////////////////////////////////////
// ⭐ START TIMED INTERVIEW
//////////////////////////////////////////////////////

export async function startTimedInterview(role) {

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

  const questions = await getHybridQuestions(role);

  const start = new Date();
  const end   = new Date(start.getTime() + 1200 * 1000);

  return db.interviewSession.create({
    data: {
      userId:    user.id,
      role,
      status:    "active",
      duration:  1200,
      startedAt: start,
      endsAt:    end,
      attempts: {
        create: questions.map((q) => ({ questionId: q.id })),
      },
    },
    include: {
      attempts: { include: { question: true } },
    },
  });
}

//////////////////////////////////////////////////////
// ⭐ EVALUATE ANSWER  (saves clarity / depth / comm)
//////////////////////////////////////////////////////

export async function evaluateAnswer(attemptId, answer) {

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

  const attempt = await db.interviewAttempt.findUnique({
    where: { id: attemptId },
    include: { question: true, session: true },
  });

  if (!attempt)                          throw new Error("Attempt not found");
  if (attempt.session.userId !== user.id) throw new Error("Forbidden");

  const prompt = `
You are a strict technical interviewer evaluating a candidate answer.

Question: ${attempt.question.question}

Candidate Answer: ${answer || "(no answer given)"}

Score each metric 0-10.

Rules:
- Return ONLY valid JSON, no markdown, no text outside JSON
- All values must be plain numbers (example: 7 not "7/10")
- feedback must be 1-2 sentences, actionable

Return exactly:
{
  "score": 7,
  "feedback": "Concise actionable feedback here.",
  "clarity": 6,
  "depth": 7,
  "communication": 8
}
`;

  const res = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    temperature: 0.3,
    messages: [
      { role: "system", content: "You are a strict interviewer. Return only JSON." },
      { role: "user", content: prompt },
    ],
  });

  const parsed = safeJsonParse(res.choices[0].message.content);

  return db.interviewAttempt.update({
    where: { id: attemptId },
    data: {
      userAnswer:    answer,
      score:         parsed?.score         ?? 0,
      feedback:      parsed?.feedback      ?? "Needs improvement",
      // extra fields — add to schema below if not present
      // clarity:    parsed?.clarity       ?? 0,
      // depth:      parsed?.depth         ?? 0,
      // communication: parsed?.communication ?? 0,
    },
  });
}

//////////////////////////////////////////////////////
// ⭐ FINISH INTERVIEW
//////////////////////////////////////////////////////

export async function finishInterview(sessionId) {

  const attempts = await db.interviewAttempt.findMany({
    where: { sessionId },
  });

  const attempted = attempts.filter((a) => a.userAnswer);

  const avg =
    attempted.reduce((sum, a) => sum + (a.score ?? 0), 0) /
    (attempted.length || 1);

  return db.interviewSession.update({
    where: { id: sessionId },
    data: {
      totalScore:  avg,
      status:      "completed",
      completedAt: new Date(),
    },
  });
}