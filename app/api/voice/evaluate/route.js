import Groq from "groq-sdk"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req) {
  try {
    const { question: currentQuestion, transcript, duration } = await req.json()

    const prompt = `
You are a senior technical interviewer.

Evaluate the spoken answer.

QUESTION:
${currentQuestion}

ANSWER:
${transcript}

Also consider:
Speech duration in seconds: ${duration}

Return JSON only:

{
score: number (0-10),
communication: number (0-10),
clarity: number (0-10),
confidence: number (0-10),
feedback: "short improvement feedback"
}
`

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
    })

    const text = completion.choices[0].message.content

    return Response.json({
      success: true,
      raw: text,
    })
  } catch (err) {
    console.error(err)
    return Response.json({ error: "Evaluation failed" }, { status: 500 })
  }
}