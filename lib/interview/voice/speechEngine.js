import { VOICE_PRESETS } from "../config/voice"

/*
  VOICE_PRESETS shape (from config/voice.js):
  {
    indian:   { rate: 0.92, pitch: 0.9 },
    american: { rate: 1,    pitch: 1   },
    formal:   { rate: 0.85, pitch: 0.8 },
    mentor:   { rate: 1.05, pitch: 1.1 },
    pressure: { rate: 1.15, pitch: 0.95 }
  }
*/

class SpeechEngine {
  constructor() {
    this.unlocked = false
    this.queue    = []
    this.busy     = false
    this._voices  = []

    // Load voices (browser loads them async)
    if (typeof window !== "undefined") {
      const load = () => { this._voices = window.speechSynthesis.getVoices() }
      load()
      window.speechSynthesis.onvoiceschanged = load
    }
  }

  // ── Must call from a click handler once ─────────────────────────────────
  unlock() {
    if (this.unlocked) return
    const u = new SpeechSynthesisUtterance("")
    u.volume = 0
    window.speechSynthesis.speak(u)
    this.unlocked = true
  }

  // ── Add text to speak queue ──────────────────────────────────────────────
  speak(text, { presetKey = "indian", onStart, onEnd } = {}) {
    if (!text?.trim()) return
    this.queue.push({ text, presetKey, onStart, onEnd })
    if (this.unlocked) this._flush()
  }

  // ── Stop everything ──────────────────────────────────────────────────────
  cancel() {
    this.queue = []
    this.busy  = false
    window.speechSynthesis.cancel()
  }

  // ── Internal drain ───────────────────────────────────────────────────────
  _flush() {
    if (this.busy || this.queue.length === 0) return
    const { text, presetKey, onStart, onEnd } = this.queue.shift()

    // ⭐ Get preset — this is what was broken before
    const preset = VOICE_PRESETS[presetKey] ?? VOICE_PRESETS.indian

    const u      = new SpeechSynthesisUtterance(text)
    u.rate       = preset.rate   // e.g. 1.15 for pressure, 0.85 for formal
    u.pitch      = preset.pitch  // e.g. 1.1 for mentor, 0.8 for formal
    u.volume     = 1

    // ⭐ Pick a browser voice that matches the preset character
    const voice  = this._pickVoice(presetKey)
    if (voice) u.voice = voice

    this.busy = true

    u.onstart = () => { onStart?.() }

    u.onend = () => {
      this.busy = false
      onEnd?.()
      this._flush()
    }

    u.onerror = () => {
      this.busy = false
      onEnd?.()   // treat error as end so interview continues
      this._flush()
    }

    window.speechSynthesis.speak(u)
  }

  // ⭐ Pick best browser voice for the preset style
  _pickVoice(presetKey) {
    const voices = this._voices
    if (!voices.length) return null

    // Preference order per style
    const prefs = {
      indian:   ["Rishi", "Veena", "Google हिन्दी", "Google UK English Male"],
      american: ["Google US English", "Alex", "Samantha", "en-US"],
      formal:   ["Daniel", "Google UK English Male", "en-GB"],
      mentor:   ["Karen", "Google UK English Female", "Samantha"],
      pressure: ["Google US English", "Alex", "en-US"],
    }

    const wanted = prefs[presetKey] || prefs.indian

    for (const name of wanted) {
      const match = voices.find(v =>
        v.name.toLowerCase().includes(name.toLowerCase()) ||
        v.lang.toLowerCase().includes(name.toLowerCase())
      )
      if (match) return match
    }

    // Fallback: first English voice
    return voices.find(v => v.lang.startsWith("en")) || voices[0]
  }

  get isSpeaking() { return this.busy }
}

export const speechEngine = new SpeechEngine()