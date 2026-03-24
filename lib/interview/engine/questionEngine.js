import { selectNextSkill } from "./skillSelector"
import { INTERVIEW_MODES } from "../config/modes"

/*
  history example:
  [
    { skill: "React hooks", score: 6 },
    { skill: "API design", score: 4 }
  ]
*/

export async function generateNextQuestion({
  roleKey,
  history = [],
  modeKey = "fresher"
}) {

  const mode = INTERVIEW_MODES[modeKey] || INTERVIEW_MODES["fresher"]

  const skill = selectNextSkill({
    roleKey,
    history,
    modeConfig: mode
  })

  const difficulty = mode.difficulty

  const prompt = `
You are a senior technical interviewer.

Generate ONE realistic interview question.

Role: ${roleKey}
Topic: ${skill}
Difficulty: ${difficulty}

Rules:
- ask practical real world question
- max 20 words
- do NOT explain
- do NOT add numbering
`

  try {

    const res = await fetch("/api/ai/followup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    })

    if (!res.ok) throw new Error("API error")

    const data = await res.json()

    const question = data?.question || `Explain key concepts of ${skill}`

    return {
      question,
      skill,
      difficulty,
      type: history.length === 0 ? "base" : "followup"
    }

  } catch {

    return {
      question: `Explain key concepts of ${skill}`,
      skill,
      difficulty,
      type: "fallback"
    }

  }
}