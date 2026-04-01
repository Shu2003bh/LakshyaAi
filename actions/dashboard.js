"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getDashboardData() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
      skillXP: true,
      assessments: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      interviewSessions: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          attempts: true,
        },
      },
      roadmaps: {
        include: {
          steps: { orderBy: { stepOrder: "asc" } },
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      },
    },
  });

  if (!user) throw new Error("User not found");

  const completedSessions = user.interviewSessions.filter(
    (s) => s.status === "completed"
  );
  const totalInterviews = completedSessions.length;
  const avgScore =
    completedSessions.length > 0
      ? Math.round(
          completedSessions.reduce((sum, s) => sum + (s.totalScore ?? 0), 0) /
            completedSessions.length
        )
      : 0;

  const performanceTrend = completedSessions
    .slice(0, 8)
    .reverse()
    .map((s, i) => ({
      label: `S${i + 1}`,
      score: Math.round(s.totalScore ?? 0),
    }));

  const allAttempts = user.interviewSessions.flatMap((s) => s.attempts);
  const avgMetric = (field) => {
    const vals = allAttempts.map((a) => a[field]).filter((v) => v != null);
    return vals.length
      ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
      : 0;
  };

  const lastFeedback =
    allAttempts
      .filter((a) => a.feedback)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
      ?.feedback ?? null;

  const totalAssessments = user.assessments.length;
  const avgQuizScore =
    user.assessments.length > 0
      ? Math.round(
          user.assessments.reduce((sum, a) => sum + a.quizScore, 0) /
            user.assessments.length
        )
      : 0;

  const categoryScores = {};
  user.assessments.forEach((a) => {
    if (!categoryScores[a.category]) categoryScores[a.category] = [];
    categoryScores[a.category].push(a.quizScore);
  });
  const assessmentBreakdown = Object.entries(categoryScores).map(
    ([cat, scores]) => ({
      category: cat,
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      count: scores.length,
    })
  );

  const totalXP = user.skillXP.reduce((sum, s) => sum + s.xp, 0);
  const maxLevel = user.skillXP.length
    ? Math.max(...user.skillXP.map((s) => s.level))
    : 1;
  const streak = user.skillXP.length
    ? Math.max(...user.skillXP.map((s) => s.streak))
    : 0;

  const roadmapProgress = user.roadmaps.map((r) => {
    const total = r.steps.length;
    const done = r.steps.filter((s) => s.completed).length;
    return {
      skill: r.skill,
      total,
      done,
      pct: total > 0 ? Math.round((done / total) * 100) : 0,
      status: r.status,
    };
  });

  return {
    user: {
      name: user.name,
      email: user.email,
      imageUrl: user.imageUrl,
      industry: user.industry,
      experience: user.experience,
      skills: user.skills ?? [],
    },
    insights: user.industryInsight,
    stats: {
      totalInterviews,
      avgScore,
      totalAssessments,
      avgQuizScore,
      totalXP,
      maxLevel,
      streak,
    },
    performanceTrend,
    interviewAnalytics: {
      clarity: avgMetric("clarityScore"),
      depth: avgMetric("depthScore"),
      communication: avgMetric("communicationScore"),
    },
    lastFeedback,
    skillXP: user.skillXP,
    roadmapProgress,
    assessmentBreakdown,
  };
}