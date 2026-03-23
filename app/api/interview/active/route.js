import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {

  const { userId } = await auth();
  if (!userId) return NextResponse.json(null);

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  const session = await db.interviewSession.findFirst({
    where: {
      userId: user.id,
      status: "active",
    },
    include: {
      attempts: {
        include: { question: true },
      },
    },
    orderBy: {
      startedAt: "desc",
    },
  });

  return NextResponse.json(session);
}