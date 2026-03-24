import { NextResponse } from "next/server"

// ─── Fallback pool — never let interview die ───────────────────────────────
const FALLBACKS = [
  { type: "new_topic", difficulty: "medium",  question: "Explain the difference between stack and queue with a real-world example." },
  { type: "new_topic", difficulty: "medium",  question: "What is time complexity? Give an example of O(n log n)." },
  { type: "new_topic", difficulty: "easy",    question: "What is the difference between let, const, and var in JavaScript?" },
  { type: "new_topic", difficulty: "hard",    question: "How does garbage collection work in modern JavaScript engines?" },
  { type: "followup",  difficulty: "medium",  question: "Can you explain that with a concrete real-world example?" },
]
let fallbackIndex = 0
function getRotatingFallback() {
  const f = FALLBACKS[fallbackIndex % FALLBACKS.length]
  fallbackIndex++
  return f
}

// ─── Safe JSON extractor ───────────────────────────────────────────────────
function extractJSON(raw) {
  if (!raw || typeof raw !== "string") return null

  // Strip markdown fences
  let cleaned = raw
    .replace(/```json[\s\S]*?```/gi, (m) => m.replace(/```json/gi, "").replace(/```/g, ""))
    .replace(/```/g, "")
    .trim()

  // Find outermost { ... } — walk character by character
  let start = -1
  let depth = 0
  let end = -1

  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] === "{") {
      if (start === -1) start = i   // first { found
      depth++
    } else if (cleaned[i] === "}") {
      depth--
      if (depth === 0 && start !== -1) {
        end = i
        break                        // found matching closing brace
      }
    }
  }

  // Guard: no valid JSON object found
  if (start === -1 || end === -1 || end <= start) return null

  const jsonStr = cleaned.slice(start, end + 1)

  try {
    return JSON.parse(jsonStr)
  } catch {
    return null
  }
}

// ─── Validate parsed object has required fields ───────────────────────────
function isValidQuestion(obj) {
  return (
    obj &&
    typeof obj.question === "string" &&
    obj.question.trim().length > 0
  )
}

// ─── System prompt — forces JSON output ───────────────────────────────────
const SYSTEM_PROMPT = `You are an AI technical interview question generator.
You MUST respond with ONLY a valid JSON object. 
No explanations, no markdown, no code fences, no prose before or after.
No trailing commas. No comments inside JSON.

Required JSON schema:
{
  "type": "followup" | "new_topic",
  "difficulty": "easy" | "medium" | "hard",
  "question": "the interview question string here"
}

Example of a valid response:
{"type":"followup","difficulty":"medium","question":"Can you walk me through how you would optimize that query?"}`

// ─── Route handler ────────────────────────────────────────────────────────
export async function POST(req) {
  try {
    const { prompt } = await req.json()

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(getRotatingFallback())
    }

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,          // low = deterministic JSON, not creative prose
        max_tokens: 200,           // question never needs more than this
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user",   content: prompt },
        ],
      }),
    })

    if (!groqRes.ok) {
      console.error("GROQ HTTP error", groqRes.status, await groqRes.text())
      return NextResponse.json(getRotatingFallback())
    }

    const data = await groqRes.json()
    const text = data?.choices?.[0]?.message?.content

    if (!text) {
      console.error("GROQ empty content", JSON.stringify(data))
      return NextResponse.json(getRotatingFallback())
    }

    // Try to extract valid JSON
    const parsed = extractJSON(text)

    if (!isValidQuestion(parsed)) {
      console.error("FOLLOWUP: could not parse valid question from:", text)
      return NextResponse.json(getRotatingFallback())
    }

    // Sanitize — ensure all fields present with safe defaults
    return NextResponse.json({
      type:       parsed.type       || "new_topic",
      difficulty: parsed.difficulty || "medium",
      question:   parsed.question.trim(),
    })

  } catch (err) {
    console.error("FOLLOWUP FATAL ERROR", err?.message || err)
    return NextResponse.json(getRotatingFallback())
  }
}