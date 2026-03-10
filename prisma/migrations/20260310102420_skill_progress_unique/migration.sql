-- DropIndex
DROP INDEX "SkillProgress_userId_skill_key";

-- CreateIndex
CREATE INDEX "SkillProgress_userId_idx" ON "SkillProgress"("userId");
