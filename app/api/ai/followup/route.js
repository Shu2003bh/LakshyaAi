import { NextResponse } from "next/server"

export async function POST(req) {

  try {

    const { prompt } = await req.json()

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    })

    const data = await groqRes.json()

    const text = data?.choices?.[0]?.message?.content

    // ⭐ VERY IMPORTANT SAFE CHECK
    if (!text) {
      console.log("Groq empty response", data)

      return NextResponse.json({
        type: "new_topic",
        difficulty: "medium",
        question: "Explain difference between stack and queue."
      })
    }

    let cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")

    const first = cleaned.indexOf("{")
    const last = cleaned.lastIndexOf("}")

    cleaned = cleaned.substring(first, last + 1)

    const parsed = JSON.parse(cleaned)

    return NextResponse.json(parsed)

  } catch (err) {

    console.log("FOLLOWUP ERROR", err)

    return NextResponse.json({
      type: "new_topic",
      difficulty: "medium",
      question: "What is time complexity?"
    })
  }
}