"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Groq from "groq-sdk";
import { safeJsonParse } from "@/lib/safeJson";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* ----------------------------------
   GENERATE AI INDUSTRY INSIGHTS
-----------------------------------*/
export const generateAIInsights = async (industry) => {
  const prompt = `
Analyze the current state of the ${industry} industry.

Return STRICTLY the following JSON format only:
{
  "salaryRanges": [
    { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
  ],
  "growthRate": number,
  "demandLevel": "High" | "Medium" | "Low",
  "topSkills": ["skill1", "skill2"],
  "marketOutlook": "Positive" | "Neutral" | "Negative",
  "keyTrends": ["trend1", "trend2"],
  "recommendedSkills": ["skill1", "skill2"]
}

Rules:
- Include at least 5 roles in salaryRanges
- growthRate must be a percentage number
- Include at least 5 skills and trends
- Respond ONLY with valid JSON
`;

  const res = await groq.chat.completions.create({
    model: "llama-3.1-70b-versatile", // insights need better reasoning
    temperature: 0.4,
    max_tokens: 900,
    messages: [
      {
        role: "system",
        content:
          "You are a senior industry analyst. Respond ONLY with valid JSON. No extra text.",
      },
      { role: "user", content: prompt },
    ],
  });

  const rawText = res.choices[0].message.content;

  return safeJsonParse(rawText);
};

/* ----------------------------------
   GET / CREATE INDUSTRY INSIGHTS
-----------------------------------*/
export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");

  // Generate insights if not present
  if (!user.industryInsight) {
    const insights = await generateAIInsights(user.industry);

    const industryInsight = await db.industryInsight.create({
      data: {
        industry: user.industry,
        ...insights,
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return industryInsight;
  }

  return user.industryInsight;
}
