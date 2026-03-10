// "use server";

// import { db } from "@/lib/prisma";
// import { auth } from "@clerk/nextjs/server";
// import { revalidatePath } from "next/cache";
// import { generateAIInsights } from "./dashboard";

// export async function updateUser(data) {
//   const { userId } = await auth();
//   if (!userId) throw new Error("Unauthorized");

//   const user = await db.user.findUnique({
//     where: { clerkUserId: userId },
//   });

//   if (!user) throw new Error("User not found");

//   try {
//     // ✅ 1. Check existing industry insight
//     let industryInsight = await db.industryInsight.findUnique({
//       where: { industry: data.industry },
//     });

//     // ✅ 2. Generate AI insights OUTSIDE transaction
//     let insights = null;

//     if (!industryInsight) {
//       try {
//         insights = await generateAIInsights(data.industry);
//       } catch (err) {
//         console.error("AI failed:", err.message);
//       }
//     }

//     // ✅ 3. Transaction (ONLY DB OPERATIONS)
//     const result = await db.$transaction(async (tx) => {

//       // ✅ create industry insight safely
//       if (!industryInsight) {

//         const safeInsights = {
//           industry: data.industry,

//           growthRate: insights?.growthRate ?? 0,
//           demandLevel: insights?.demandLevel ?? "Medium",
//           marketOutlook: insights?.marketOutlook ?? "Stable",

//           salaryRanges: insights?.salaryRanges ?? [],
//           topSkills: insights?.topSkills ?? [],
//           keyTrends: insights?.keyTrends ?? [],
//           recommendedSkills:
//             insights?.recommendedSkills ?? [],

//           nextUpdate: new Date(
//             Date.now() + 7 * 24 * 60 * 60 * 1000
//           ),
//         };

//         industryInsight =
//           await tx.industryInsight.create({
//             data: safeInsights,
//           });
//       }

//       // ✅ update user
//       const updatedUser = await tx.user.update({
//         where: { id: user.id },
//         data: {
//           industry: data.industry,
//           experience: data.experience,
//           bio: data.bio,
//           skills: data.skills ?? [],
//         },
//       });

//       return { updatedUser, industryInsight };
//     });

//     revalidatePath("/");
//     return result.updatedUser;

//   } catch (error) {
//     console.error("Error updating user:", error);
//     throw new Error("Failed to update profile");
//   }
// }

"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  console.log("🔹 Clerk User ID:", userId);

let user = await db.user.findUnique({
  where: { clerkUserId: userId },
});

if (!user) {
  user = await db.user.create({
    data: {
      clerkUserId: userId,
      email: "",
    },
  });
}

  try {
    // 1️⃣ Check existing industry insight
    let industryInsight = await db.industryInsight.findUnique({
      where: { industry: data.industry },
    });

    let insights = null;

    // 2️⃣ Generate AI insights
    if (!industryInsight) {
      try {
        console.log("⚡ Generating AI insights for:", data.industry);

        insights = await generateAIInsights(data.industry);

        console.log("✅ AI Insights Response:", insights);

      } catch (err) {
        console.error("❌ AI failed:", err.message);
      }
    }

    // 3️⃣ DB Transaction
    const result = await db.$transaction(async (tx) => {

      if (!industryInsight) {

        const safeInsights = {
          industry: data.industry,

          growthRate: insights?.growthRate ?? 0,
          demandLevel: insights?.demandLevel ?? "Medium",
          marketOutlook: insights?.marketOutlook ?? "Stable",

          salaryRanges: insights?.salaryRanges ?? [],
          topSkills: insights?.topSkills ?? [],
          keyTrends: insights?.keyTrends ?? [],
          recommendedSkills: insights?.recommendedSkills ?? [],

          nextUpdate: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ),
        };

        console.log("📦 Saving insights to DB:", safeInsights);

        industryInsight = await tx.industryInsight.create({
          data: safeInsights,
        });
      }

      // update user profile
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          industry: data.industry,
          experience: data.experience,
          bio: data.bio,
          skills: data.skills ?? [],
        },
      });

      return { updatedUser, industryInsight };
    });

    revalidatePath("/");

    return result.updatedUser;

  } catch (error) {
    console.error("❌ Error updating user:", error);
    throw new Error("Failed to update profile");
  }
}