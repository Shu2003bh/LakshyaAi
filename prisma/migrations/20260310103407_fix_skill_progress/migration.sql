/*
  Warnings:

  - Added the required column `updatedAt` to the `SkillProgress` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SkillProgress" ADD COLUMN     "progress" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
