"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

//////////////////////////////////////////////////////
// ✅ SAVE VOICE INTERVIEW RESULT
//////////////////////////////////////////////////////

export async function saveVoiceInterviewResult(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  const {
    role,
    mode,
    duration,
    totalScore,
    feedback,
    scores,
    strongAreas,
    weakAreas,
  } = data;

  // Save voice interview session
  const session = await db.voiceInterviewSession.create({
    data: {
      userId: user.id,
      role: role || "General",
      mode: mode || "fresher",
      duration: duration || 10,
      totalScore: totalScore || 0,
      feedback: feedback || null,
      scores: scores || [],
      strongAreas: strongAreas || [],
      weakAreas: weakAreas || [],
      status: "completed",
    },
  });

  // Update SkillXP based on voice interview performance
  const skillName = role?.replace(/_/g, " ") || "General";
  const accuracy = Math.round((totalScore || 0) * 10); // score is 0-10, convert to %

  await db.skillXP.upsert({
    where: {
      userId_skill: {
        userId: user.id,
        skill: skillName,
      },
    },
    update: {
      xp: { increment: accuracy },
      streak: { increment: 1 },
    },
    create: {
      userId: user.id,
      skill: skillName,
      xp: accuracy,
      level: 1,
      streak: 1,
    },
  });

  return session;
}

//////////////////////////////////////////////////////
// ✅ GET VOICE INTERVIEW HISTORY
//////////////////////////////////////////////////////

export async function getVoiceInterviewHistory() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  return db.voiceInterviewSession.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}
