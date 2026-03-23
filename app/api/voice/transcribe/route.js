import Groq from "groq-sdk"

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req) {
    try {
        const formData = await req.formData()
        const file = formData.get("audio")

        if (!file) {
            return Response.json({ error: "No audio" }, { status: 400 })
        }

        const audioFile = new File(
            [await file.arrayBuffer()],
            "recording.webm",
            { type: "audio/webm" }
        )

        const transcription = await groq.audio.transcriptions.create({
            file: audioFile,
            model: "whisper-large-v3",
            response_format: "json",
        })

        return Response.json({
            success: true,
            transcript: transcription.text,
        })
    } catch (err) {
        console.error("TRANSCRIBE ERROR:", err)
        return Response.json({ error: "Transcription failed" }, { status: 500 })
    }
}