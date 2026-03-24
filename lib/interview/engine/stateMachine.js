/*
  stateMachine.js
  ──────────────
  Lightweight FSM for the voice interview session.
  No external library needed — pure JS state + transition map.

  States:
    INIT → ASKING → THINKING → READY → RECORDING
         → PROCESSING → DECIDING → ASKING (loop)
                                 → COMPLETED

  Usage (in session page):
    import { STATES, canTransition, nextStateAfter } from "./stateMachine"
    if (canTransition(current, "STOP_RECORDING")) setState(STATES.PROCESSING)
*/

/* ── State constants ────────────────────────────────────────────────────── */

export const STATES = {
  INIT:        "init",
  ASKING:      "asking",       // AI is speaking the question
  THINKING:    "thinking",     // countdown timer before recording
  READY:       "ready",        // user can click Record
  RECORDING:   "recording",    // mic is active
  PROCESSING:  "processing",   // transcribe + evaluate API calls
  DECIDING:    "deciding",     // check session over?
  COMPLETED:   "completed",    // final report ready
  ERROR:       "error"         // something went wrong
}

/* ── Valid transitions map ──────────────────────────────────────────────── */
//   event → [allowed from states] → target state

const TRANSITIONS = [
  { event: "SESSION_READY",   from: [STATES.INIT],       to: STATES.ASKING      },
  { event: "SPEECH_START",    from: [STATES.INIT,
                                     STATES.DECIDING],    to: STATES.ASKING      },
  { event: "SPEECH_END",      from: [STATES.ASKING],     to: STATES.THINKING    },
  { event: "THINK_DONE",      from: [STATES.THINKING],   to: STATES.READY       },
  { event: "START_RECORDING", from: [STATES.READY],      to: STATES.RECORDING   },
  { event: "STOP_RECORDING",  from: [STATES.RECORDING],  to: STATES.PROCESSING  },
  { event: "EVAL_DONE",       from: [STATES.PROCESSING], to: STATES.DECIDING    },
  { event: "NEXT_QUESTION",   from: [STATES.DECIDING],   to: STATES.ASKING      },
  { event: "SESSION_OVER",    from: [STATES.DECIDING,
                                     STATES.RECORDING,
                                     STATES.READY],       to: STATES.COMPLETED   },
  { event: "ERROR",           from: Object.values(STATES), to: STATES.ERROR     },
  { event: "RETRY",           from: [STATES.ERROR],      to: STATES.READY       },
]

/* ── Guard: is this transition allowed? ─────────────────────────────────── */

export function canTransition(currentState, event) {
  return TRANSITIONS.some(
    t => t.event === event && t.from.includes(currentState)
  )
}

/* ── Get target state for an event ─────────────────────────────────────── */

export function nextState(currentState, event) {
  const match = TRANSITIONS.find(
    t => t.event === event && t.from.includes(currentState)
  )
  if (!match) {
    console.warn(`[FSM] Invalid transition: ${currentState} + ${event}`)
    return currentState   // stay in current state if invalid
  }
  return match.to
}

/* ── Convenience: log transition (dev only) ─────────────────────────────── */

export function logTransition(from, event, to) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[FSM] ${from} --[${event}]--> ${to}`)
  }
}