import { ROLES } from "../config/roles"

/*
  history = [
    { skill: "React hooks", score: 6 },
    { skill: "State management", score: 4 }
  ]
*/

export function selectNextSkill({
  roleKey,
  history = [],
  modeConfig
}) {

  const role = ROLES[roleKey]

  if (!role) {
    return "General fundamentals"
  }

  const allSkills = role.skills

  /* ---- skills already used ---- */

  const usedSkills = history.map(h => h.skill)

  /* ---- try unused first ---- */

  const remaining = allSkills.filter(
    s => !usedSkills.includes(s)
  )

  if (remaining.length > 0) {
    return remaining[
      Math.floor(Math.random() * remaining.length)
    ]
  }

  /* ---- if all used → adaptive selection ---- */

  const weakAreas = history
    .filter(h => h.score <= 6)
    .map(h => h.skill)

  if (weakAreas.length > 0) {
    return weakAreas[
      Math.floor(Math.random() * weakAreas.length)
    ]
  }

  /* ---- fallback random ---- */

  return allSkills[
    Math.floor(Math.random() * allSkills.length)
  ]
}