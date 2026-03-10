"use server";
// import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Groq from "groq-sdk";
import { safeJsonParse } from "@/lib/safeJson";
import { currentUser } from "@clerk/nextjs/server";

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
  "salaryRanges":[
    { "role":"string","min":number,"max":number,"median":number,"location":"string"}
  ],
  "growthRate":number,
  "demandLevel":"High | Medium | Low",
  "topSkills":["skill1","skill2"],
  "marketOutlook":"Positive | Neutral | Negative",
  "keyTrends":["trend1","trend2"],
  "recommendedSkills":["skill1","skill2"]
}

Rules:
- Include minimum 5 roles
- Include minimum 5 skills
- Respond ONLY JSON
`;

  const res = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    temperature: 0.4,
    max_tokens: 900,
    messages: [
      {
        role: "system",
        content: "You are a senior industry analyst. Return ONLY JSON."
      },
      {
        role: "user",
        content: prompt
      }
    ]
  });

  return safeJsonParse(res.choices[0].message.content);
};

/* ----------------------------------
   GET OR CREATE INDUSTRY INSIGHTS
-----------------------------------*/
export async function getIndustryInsights() {

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const clerkUser = await currentUser();

  let user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    user = await db.user.create({
      data: {
        clerkUserId: userId,
        email: clerkUser.emailAddresses[0].emailAddress,
        name: clerkUser.fullName,
        imageUrl: clerkUser.imageUrl,
        skills: []
      },
    });
  }

  // Fetch user with insights
  user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true
    }
  });

  if (!user) throw new Error("User not found");

  /* -----------------------------
     CREATE INSIGHTS IF MISSING
  -----------------------------*/
  if (!user.industryInsight) {

    const insights = await generateAIInsights(user.industry || "Technology");

    const industryInsight = await db.industryInsight.create({
      data: {
        industry: user.industry || "Technology",

        salaryRanges: insights.salaryRanges || [],

        growthRate: insights.growthRate ?? 0,

        demandLevel: insights.demandLevel || "Medium",

        topSkills: insights.topSkills || [],

        marketOutlook: insights.marketOutlook || "Neutral",

        keyTrends: insights.keyTrends || [],

        recommendedSkills: insights.recommendedSkills || [],

        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return industryInsight;
  }

  return user.industryInsight;
}

/* ----------------------------------
   GENERATE SKILL ROADMAP
-----------------------------------*/
export async function generateSkillRoadmap(skill) {

  const prompt = `
Create a structured learning roadmap for ${skill}.

Return ONLY JSON in this format:

{
 "skill":"${skill}",
 "steps":[
   {
     "step":"Step title",
     "description":"Short explanation"
   }
 ]
}

Rules:
- Return 10 steps
- Beginner → Advanced
- Respond ONLY JSON
`;

  const res = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    temperature: 0.3,
    max_tokens: 700,
    messages: [
      {
        role: "system",
        content: "You are a senior developer mentor. Return ONLY JSON."
      },
      {
        role: "user",
        content: prompt
      }
    ]
  });

  const parsed = safeJsonParse(res.choices[0].message.content);

  // fallback safety
  if (!parsed?.steps || !Array.isArray(parsed.steps)) {

    return {
      skill,
      steps: [
        {
          step: "Learn Fundamentals",
          description: `Understand basics of ${skill}`
        },
        {
          step: "Core Concepts",
          description: `Study core concepts and theory`
        },
        {
          step: "Hands-on Practice",
          description: `Build small practical projects`
        },
        {
          step: "Advanced Tools",
          description: `Learn industry tools and frameworks`
        },
        {
          step: "Portfolio Projects",
          description: `Create real world projects`
        }
      ]
    };
  }

  return parsed;
}
export async function toggleSkillStep(skill, step) {

  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const user = await db.user.findUnique({
    where: { clerkUserId: userId }
  })

  const existing = await db.skillProgress.findFirst({
    where: {
      userId: user.id,
      skill,
      step
    }
  })

  if (existing) {

    return await db.skillProgress.update({
      where: { id: existing.id },
      data: {
        completed: !existing.completed,
        progress: existing.completed
          ? Math.max(existing.progress - 10, 0)
          : Math.min(existing.progress + 10, 100)
      }
    })

  }

  return await db.skillProgress.upsert({
    where: {
      userId_skill: {
        userId: user.id,
        skill: skill
      }
    },
    update: {
      step: step,
      completed: true
    },
    create: {
      userId: user.id,
      skill: skill,
      step: step,
      completed: true,
      progress: 0
    }
  })
}
export async function saveSkillProgress(skill) {

  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const progress = await db.skillProgress.upsert({
    where: {
      userId_skill: {
        userId: user.id,
        skill: skill
      }
    },
    update: {},
    create: {
      userId: user.id,
      skill: skill,
      step: "Introduction",   // 👈 required field
      progress: 0
    }
  });

  return progress;
}


export async function getSkillProgress() {

  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const skills = await db.skillProgress.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return skills;
}