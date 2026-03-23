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

  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const user = await db.user.findUnique({
    where: { clerkUserId: userId }
  })

  if (!user) throw new Error("User not found")

  // ⭐ STEP 1 — check existing roadmap (VERY IMPORTANT)
  const existing = await db.skillRoadmap.findUnique({
    where: {
      userId_skill: {
        userId: user.id,
        skill: skill
      }
    },
    include: {
      steps: {
        orderBy: { stepOrder: "asc" }
      }
    }
  })

  if (existing) {
    return existing
  }

  // ⭐ STEP 2 — call AI only if roadmap not exists
  const prompt = `
Create a structured learning roadmap for ${skill}.
Return JSON:
{
 "steps":[
   { "step":"title","description":"text" }
 ]
}
Rules:
- 10 steps
- Beginner to advanced
`

  const res = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    temperature: 0.3,
    max_tokens: 700,
    messages: [
      { role: "system", content: "You are a senior tech mentor. JSON only." },
      { role: "user", content: prompt }
    ]
  })

  const parsed = safeJsonParse(res.choices[0].message.content)

  const steps =
    parsed?.steps && Array.isArray(parsed.steps)
      ? parsed.steps
      : [
          { step: "Fundamentals", description: "Learn basics" },
          { step: "Core Concepts", description: "Understand theory" },
          { step: "Practice", description: "Build mini projects" },
          { step: "Advanced Tools", description: "Learn frameworks" },
          { step: "Real Projects", description: "Build portfolio" }
        ]

  // ⭐ STEP 3 — transaction create roadmap + steps
  const roadmap = await db.$transaction(async (tx) => {

    const createdRoadmap = await tx.skillRoadmap.create({
      data: {
        userId: user.id,
        skill: skill
      }
    })

    await tx.roadmapStep.createMany({
      data: steps.map((s, i) => ({
        roadmapId: createdRoadmap.id,
        title: s.step,
        description: s.description,
        stepOrder: i + 1
      }))
    })

    return tx.skillRoadmap.findUnique({
      where: { id: createdRoadmap.id },
      include: {
        steps: {
          orderBy: { stepOrder: "asc" }
        }
      }
    })

  })

  return roadmap
}
export async function toggleRoadmapStep(stepId) {

  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  // ⭐ find user
  const user = await db.user.findUnique({
    where: { clerkUserId: userId }
  })

  if (!user) throw new Error("User not found")

  // ⭐ verify step belongs to this user (VERY IMPORTANT security check)
  const step = await db.roadmapStep.findUnique({
    where: { id: stepId },
    include: {
      roadmap: true
    }
  })

  if (!step) throw new Error("Step not found")

  if (step.roadmap.userId !== user.id) {
    throw new Error("Forbidden")
  }

  // ⭐ toggle completion
  const updated = await db.roadmapStep.update({
    where: { id: stepId },
    data: {
      completed: !step.completed
    }
  })

  return updated
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


// export async function getSkillProgress() {

//   const { userId } = await auth();

//   if (!userId) throw new Error("Unauthorized");

//   const user = await db.user.findUnique({
//     where: { clerkUserId: userId },
//   });

//   if (!user) throw new Error("User not found");

//   const skills = await db.skillProgress.findMany({
//     where: {
//       userId: user.id,
//     },
//     orderBy: {
//       createdAt: "desc",
//     },
//   });

//   return skills;
// }