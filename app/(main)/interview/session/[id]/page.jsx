import { db } from "@/lib/prisma";
import InterviewSessionClient from "./session-client";
export default async function Page(props) {

  const { id } = await props.params;   // ⭐ FIX

  const session = await db.interviewSession.findUnique({
    where: { id },
    include: {
      attempts: {
        include: { question: true },
      },
    },
  });

  if (!session) return <div>Session not found</div>;

  return <InterviewSessionClient session={session} />;
}