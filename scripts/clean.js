import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function clean() {
  try {
    console.log("🧹 Cleaning DB...");

    // ✅ STEP 1: delete attempts (child)
    await db.interviewAttempt.deleteMany({});
    console.log("✅ Attempts deleted");

    // ✅ STEP 2: delete sessions (optional but recommended)
    await db.interviewSession.deleteMany({});
    console.log("✅ Sessions deleted");

    // ✅ STEP 3: delete questions (parent)
    await db.interviewQuestion.deleteMany({});
    console.log("✅ Questions deleted");

  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await db.$disconnect();
  }
}

clean();