import { INTERVIEW_DURATION } from "../config/duration"

/*
  session structure:
  {
    roleKey,
    modeKey,
    durationKey,
    startTime,
    history:  [],   // [{ skill, score }]
    scores:   [],   // [number]
    completed: false
  }
*/

export function createSession({ roleKey, modeKey = "fresher", durationKey = "standard" }) {
  return {
    roleKey,
    modeKey,
    durationKey,
    startTime:  Date.now(),
    history:    [],
    scores:     [],
    completed:  false
  }
}

/* ── Time check ─────────────────────────────────────────────────────────── */

export function isSessionOver(session) {
  const allowed = INTERVIEW_DURATION[session.durationKey] || 600
  const elapsed = (Date.now() - session.startTime) / 1000
  return elapsed >= allowed
}

/* ── Record one answer ──────────────────────────────────────────────────── */

export function updateSessionAfterAnswer({ session, evaluation, skill }) {
  const score = typeof evaluation?.score === "number" ? evaluation.score : 5

  session.history.push({ skill, score })
  session.scores.push(score)
}

/* ── Final report ───────────────────────────────────────────────────────── */

export function completeSession(session) {
  session.completed = true

  const total = session.scores.length
  const avg   = total
    ? parseFloat(
        (session.scores.reduce((a, b) => a + b, 0) / total).toFixed(1)
      )
    : 0

  return {
    averageScore:    avg,
    totalQuestions:  total,
    scores:          session.history.map((h, i) => ({
      skill: h.skill,
      score: h.score,
      index: i + 1
    })),
    strongAreas: session.history.filter(h => h.score >= 8).map(h => h.skill),
    weakAreas:   session.history.filter(h => h.score <= 5).map(h => h.skill),
    feedback:    generateFeedback(avg, session.history)
  }
}

/* ── Internal feedback helper ───────────────────────────────────────────── */

function generateFeedback(avg, history) {
  if (avg >= 8)
    return "Excellent performance! You demonstrated strong command across topics. Keep practising advanced scenarios."
  if (avg >= 6)
    return "Good effort. You have a solid foundation — focus on the weaker areas to improve further."
  if (avg >= 4)
    return "Fair attempt. Revisit core concepts and practise explaining your answers more clearly."
  return "Keep practising. Focus on fundamentals and try to structure your answers better."
}