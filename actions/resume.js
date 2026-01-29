"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* ----------------------------------
   SAVE RESUME
-----------------------------------*/
export async function saveResume(content) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const resume = await db.resume.upsert({
      where: { userId: user.id },
      update: { content },
      create: { userId: user.id, content },
    });

    revalidatePath("/resume");
    return resume;
  } catch (error) {
    console.error("Error saving resume:", error);
    throw new Error("Failed to save resume");
  }
}

/* ----------------------------------
   GET RESUME
-----------------------------------*/
export async function getResume() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.resume.findUnique({
    where: { userId: user.id },
  });
}

/* ----------------------------------
   IMPROVE RESUME SECTION WITH AI
-----------------------------------*/
export async function improveWithAI({ current, type }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const prompt = `
Improve the following ${type} section for a ${user.industry} professional.

Current content:
"${current}"

Rules:
- Use strong action verbs
- Add metrics/results if possible
- Highlight relevant technical skills
- ATS-friendly keywords
- One concise paragraph only
- No explanations, no bullets, no headings
`;

  try {
    const res = await groq.chat.completions.create({
      model: "llama-3.1-70b-versatile", // best for writing quality
      temperature: 0.5,
      max_tokens: 250,
      messages: [
        {
          role: "system",
          content:
            "You are a senior resume writer specializing in ATS-optimized resumes.",
        },
        { role: "user", content: prompt },
      ],
    });

    return res.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error improving content:", error);
    throw new Error("Failed to improve content");
  }
}

