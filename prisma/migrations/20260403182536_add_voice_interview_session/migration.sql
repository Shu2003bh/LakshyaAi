/*
  Warnings:

  - You are about to drop the column `clarityScore` on the `InterviewAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `communicationScore` on the `InterviewAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `depthScore` on the `InterviewAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `feedback` on the `InterviewAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `company` on the `InterviewQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `InterviewQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `InterviewQuestion` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "InterviewAttempt_questionId_idx";

-- DropIndex
DROP INDEX "InterviewAttempt_sessionId_idx";

-- AlterTable
ALTER TABLE "InterviewAttempt" DROP COLUMN "clarityScore",
DROP COLUMN "communicationScore",
DROP COLUMN "depthScore",
DROP COLUMN "feedback",
ADD COLUMN     "isCorrect" BOOLEAN;

-- AlterTable
ALTER TABLE "InterviewQuestion" DROP COLUMN "company",
DROP COLUMN "tags",
DROP COLUMN "type",
ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'Technical',
ADD COLUMN     "correctAnswer" TEXT,
ADD COLUMN     "explanation" TEXT,
ADD COLUMN     "options" JSONB,
ALTER COLUMN "difficulty" SET DEFAULT 'Medium';

-- AlterTable
ALTER TABLE "InterviewSession" ALTER COLUMN "duration" DROP NOT NULL,
ALTER COLUMN "endsAt" DROP NOT NULL;

-- CreateTable
CREATE TABLE "VoiceInterviewSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "totalScore" DOUBLE PRECISION,
    "feedback" TEXT,
    "scores" JSONB,
    "strongAreas" TEXT[],
    "weakAreas" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'completed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoiceInterviewSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VoiceInterviewSession_userId_idx" ON "VoiceInterviewSession"("userId");

-- CreateIndex
CREATE INDEX "InterviewQuestion_category_idx" ON "InterviewQuestion"("category");

-- AddForeignKey
ALTER TABLE "VoiceInterviewSession" ADD CONSTRAINT "VoiceInterviewSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
