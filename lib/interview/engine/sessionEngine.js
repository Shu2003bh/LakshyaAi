import { INTERVIEW_DURATION } from "../config/duration"

/*
  session structure:

  {
    roleKey,
    modeKey,
    durationKey,
    startTime,
    history: [],
    scores: []
  }
*/

export function createSession({

  roleKey,
  modeKey = "fresher",
  durationKey = "standard"

}) {

  return {
    roleKey,
    modeKey,
    durationKey,
    startTime: Date.now(),
    history: [],
    scores: [],
    completed: false
  }

}

/* ---------- time control ---------- */

export function isSessionOver(session) {

  const allowed =
    INTERVIEW_DURATION[session.durationKey] || 600

  const elapsed =
    (Date.now() - session.startTime) / 1000

  return elapsed >= allowed

}

/* ---------- update after evaluation ---------- */

export function updateSessionAfterAnswer({

  session,
  evaluation,
  skill

}) {

  session.history.push({
    skill,
    score: evaluation.score
  })

  session.scores.push(evaluation.score)

}

/* ---------- final result ---------- */

export function completeSession(session) {

  session.completed = true

  const avg =
    session.scores.length
      ? (
          session.scores.reduce((a, b) => a + b, 0) /
          session.scores.length
        ).toFixed(1)
      : 0

  return {
    averageScore: avg,
    totalQuestions: session.scores.length,
    strongAreas:
      session.history
        .filter(h => h.score >= 8)
        .map(h => h.skill),

    weakAreas:
      session.history
        .filter(h => h.score <= 5)
        .map(h => h.skill)
  }

}