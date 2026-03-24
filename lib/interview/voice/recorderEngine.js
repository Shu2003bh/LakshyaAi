/*
  recorderEngine — clean MediaRecorder wrapper
  Usage:
    const rec = new RecorderEngine()
    await rec.start()
    const blob = await rec.stop()   // returns audio Blob
*/

export class RecorderEngine {

  constructor() {
    this._recorder = null
    this._stream   = null
    this._chunks   = []
    this._resolve  = null   // resolves stop() promise
  }

  /* ── Request mic + start recording ─────────────────────────────────── */
  async start() {
    // Cleanup any previous stream
    this._cleanup()

    this._stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    this._chunks = []

    const mimeType = this._getSupportedMime()
    this._recorder = new MediaRecorder(
      this._stream,
      mimeType ? { mimeType } : undefined
    )

    this._recorder.ondataavailable = (e) => {
      if (e.data?.size > 0) this._chunks.push(e.data)
    }

    this._recorder.onstop = () => {
      const blob = new Blob(this._chunks, {
        type: mimeType || "audio/webm"
      })
      this._resolve?.(blob)
      this._cleanup()
    }

    this._recorder.onerror = (e) => {
      console.error("RecorderEngine error", e)
      this._resolve?.(null)
      this._cleanup()
    }

    this._recorder.start(200)   // collect data every 200ms
  }

  /* ── Stop and get blob ──────────────────────────────────────────────── */
  stop() {
    return new Promise((resolve) => {
      if (!this._recorder || this._recorder.state === "inactive") {
        resolve(null)
        return
      }
      this._resolve = resolve
      this._recorder.stop()
    })
  }

  /* ── Is currently recording ─────────────────────────────────────────── */
  get isRecording() {
    return this._recorder?.state === "recording"
  }

  /* ── Internal helpers ───────────────────────────────────────────────── */
  _cleanup() {
    this._stream?.getTracks().forEach(t => t.stop())
    this._stream   = null
    this._recorder = null
  }

  _getSupportedMime() {
    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/mp4"
    ]
    return types.find(t => MediaRecorder.isTypeSupported(t)) || ""
  }
}