export async function generateFollowupQuestion({
  question,
  transcript,
  evaluation,
  role,
  difficulty
}) {

  const prompt = `
You are a senior ${role} interviewer.

Previous Question:
${question}

Candidate Answer:
${transcript}

Performance Signals:
Score: ${evaluation.score}/10
Confidence: ${evaluation.confidence}/10
Clarity: ${evaluation.clarity}/10
Communication: ${evaluation.communication}/10

Decide next step:

Rules:
- weak answer → ask easier clarification
- average → drill deeper
- strong → increase difficulty or change topic

Return ONLY JSON:

{
 "type":"followup | new_topic | stress",
 "difficulty":"easy | medium | hard",
 "question":"next question text"
}
`

  const res = await fetch("/api/ai/followup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prompt })
  })

  const data = await res.json()

  return data
}