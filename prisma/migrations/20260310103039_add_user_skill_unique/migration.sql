/*
  Warnings:

  - A unique constraint covering the columns `[userId,skill]` on the table `SkillProgress` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SkillProgress_userId_skill_key" ON "SkillProgress"("userId", "skill");
