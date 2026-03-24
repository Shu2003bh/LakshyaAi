import { VOICE_PRESETS } from "../config/voice"

/*
  speechEngine — handles SpeechSynthesis with:
  - autoplay unlock (must call unlock() from a user gesture)
  - voice preset support
  - queue drain so questions never overlap
*/

class SpeechEngine {

  constructor() {
    this.unlocked  = false
    this.queue     = []        // { text, preset, onStart, onEnd }
    this.speaking  = false
  }

  /* ── Call this ONCE inside a button click handler ───────────────────── */
  unlock() {
    if (this.unlocked) return
    const u = new SpeechSynthesisUtterance("")
    u.volume = 0
    window.speechSynthesis.speak(u)
    this.unlocked = true
  }

  /* ── Add text to queue ──────────────────────────────────────────────── */
  speak(text, { presetKey = "indian", onStart, onEnd } = {}) {
    if (!text) return
    this.queue.push({ text, presetKey, onStart, onEnd })
    if (this.unlocked) this._flush()
  }

  /* ── Stop everything ────────────────────────────────────────────────── */
  cancel() {
    this.queue   = []
    this.speaking = false
    window.speechSynthesis.cancel()
  }

  /* ── Internal: drain queue one item at a time ───────────────────────── */
  _flush() {
    if (this.speaking || this.queue.length === 0) return
    const { text, presetKey, onStart, onEnd } = this.queue.shift()
    const preset = VOICE_PRESETS[presetKey] || VOICE_PRESETS.indian

    const u = new SpeechSynthesisUtterance(text)
    u.rate  = preset.rate
    u.pitch = preset.pitch

    u.onstart = () => {
      this.speaking = true
      onStart?.()
    }

    u.onend = () => {
      this.speaking = false
      onEnd?.()
      this._flush()          // speak next in queue
    }

    u.onerror = () => {
      this.speaking = false
      onEnd?.()              // treat error as end so session continues
      this._flush()
    }

    window.speechSynthesis.speak(u)
  }

  get isSpeaking() {
    return this.speaking
  }
}

/* Singleton — one engine for the whole app */
export const speechEngine = new SpeechEngine()