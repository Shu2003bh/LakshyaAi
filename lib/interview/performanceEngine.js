export function calculatePerformance(evaluationHistory) {

  if (!evaluationHistory.length) return "medium"

  const last3 = evaluationHistory.slice(-3)

  const avg =
    last3.reduce((a, b) => a + b.score, 0) / last3.length

  if (avg >= 8) return "hard"
  if (avg <= 5) return "easy"

  return "medium"
}