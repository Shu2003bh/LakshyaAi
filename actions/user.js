"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  try {
    // 1️⃣ Check industry first (NO transaction)
    let industryInsight = await db.industryInsight.findUnique({
      where: { industry: data.industry },
    });

    // 2️⃣ Generate AI insights OUTSIDE transaction
    let insights = null;
    if (!industryInsight) {
      try {
        insights = await generateAIInsights(data.industry);
      } catch (aiError) {
        console.error("AI failed, skipping insights:", aiError.message);
      }
    }

    // 3️⃣ DB transaction (ONLY DB work)
    const result = await db.$transaction(async (tx) => {
      if (!industryInsight) {
        industryInsight = await tx.industryInsight.create({
          data: {
            industry: data.industry,
            ...(insights ?? {}),
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      }

      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          industry: data.industry,
          experience: data.experience,
          bio: data.bio,
          skills: data.skills,
        },
      });

      return { updatedUser, industryInsight };
    });

    revalidatePath("/");
    return result.updatedUser;
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update profile");
  }
}
// export { getUserOnboardingStatus };
