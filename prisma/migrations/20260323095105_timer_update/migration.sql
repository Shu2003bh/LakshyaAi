-- AlterTable
ALTER TABLE "InterviewSession" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "duration" INTEGER NOT NULL DEFAULT 1200,
ADD COLUMN     "startedAt" TIMESTAMP(3);
