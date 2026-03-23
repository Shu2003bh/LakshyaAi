const { PrismaClient } = require("@prisma/client")
const fs = require("fs")
const path = require("path")

const prisma = new PrismaClient()

async function main() {

  const filePath = path.join(__dirname, "interviewQuestions.json")

  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"))

  console.log("🌱 Seeding interview questions...")

  await prisma.interviewQuestion.createMany({
    data,
    skipDuplicates: true
  })

  console.log("✅ Interview questions seeded successfully")
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })