"use client"

import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Mic, Square } from "lucide-react"
import { motion } from "framer-motion"


import {
    createSession,
    isSessionOver,
    updateSessionAfterAnswer,
    completeSession
} from "@/lib/interview/engine/sessionEngine"

import { generateNextQuestion }
    from "@/lib/interview/engine/questionEngine"

const STATES = {
    INIT: "init",
    ASKING: "asking",
    THINKING: "thinking",
    READY: "ready",
    RECORDING: "recording",
    PROCESSING: "processing",
    COMPLETED: "completed",
    ERROR: "error"
}

export default function VoiceInterviewSessionPage() {

    const params = useSearchParams()

    let config = null

    try {
        const raw = params.get("config")
        if (raw) {
            config = JSON.parse(decodeURIComponent(raw))
        }
    } catch {
        config = null
    }

    /* ⭐ fallback (very important) */
    if (!config) {
        config = {
            role: "fresher_mock",
            mode: "fresher",
            duration: "standard",
            voice: "indian"
        }
    }


    const roleKey = config.role
    const [session, setSession] = useState(null)
    const [currentQ, setCurrentQ] = useState(null)

    const [state, setState] = useState(STATES.INIT)
    const [thinking, setThinking] = useState(5)
    const [recordTime, setRecordTime] = useState(0)
    const [finalReport, setFinalReport] = useState(null)

    const recorderRef = useRef(null)
    const streamRef = useRef(null)
    const chunksRef = useRef([])
    const timerRef = useRef(null)

    /* ⭐ SESSION START */

    useEffect(() => {

        const s = createSession({
            roleKey,
            modeKey: "fresher",
            durationKey: "standard"
        })

        setSession(s)

    }, [roleKey])

    /* ⭐ FIRST QUESTION */

    useEffect(() => {

        if (!session) return

        loadNext()

    }, [session])

    async function loadNext() {

        const q = await generateNextQuestion({
            roleKey: session.roleKey,
            history: session.history,
            modeKey: session.modeKey
        })

        setCurrentQ(q)

        speak(q.question)
    }

    /* ⭐ SPEAK */

    function speak(text) {

        const u = new SpeechSynthesisUtterance(text)

        u.onstart = () => setState(STATES.ASKING)

        u.onend = () => {
            setState(STATES.THINKING)
            setThinking(5)
        }

        speechSynthesis.speak(u)
    }

    /* ⭐ THINK TIMER */

    useEffect(() => {

        if (state !== STATES.THINKING) return

        const t = setInterval(() => {

            setThinking(v => {

                if (v <= 1) {
                    clearInterval(t)
                    setState(STATES.READY)
                    return 5
                }

                return v - 1
            })

        }, 1000)

        return () => clearInterval(t)

    }, [state])

    /* ⭐ RECORD */

    const startRecording = async () => {

        try {

            const stream =
                await navigator.mediaDevices.getUserMedia({ audio: true })

            streamRef.current = stream

            const rec = new MediaRecorder(stream)
            recorderRef.current = rec
            chunksRef.current = []

            rec.ondataavailable = e => {
                if (e.data.size > 0)
                    chunksRef.current.push(e.data)
            }

            rec.onstop = processAnswer

            rec.start()

            timerRef.current = setInterval(() => {
                setRecordTime(t => t + 1)
            }, 1000)

            setRecordTime(0)
            setState(STATES.RECORDING)

        } catch {
            setState(STATES.ERROR)
        }
    }

    const stopRecording = () => {

        clearInterval(timerRef.current)

        recorderRef.current?.stop()

        streamRef.current
            ?.getTracks()
            .forEach(t => t.stop())
    }

    /* ⭐ PROCESS ANSWER */

    async function processAnswer() {

        setState(STATES.PROCESSING)

        try {

            const blob =
                new Blob(chunksRef.current, { type: "audio/webm" })

            const fd = new FormData()
            fd.append("audio", blob)

            const tRes =
                await fetch("/api/voice/transcribe", {
                    method: "POST",
                    body: fd
                })

            const tData = await tRes.json()

            const eRes =
                await fetch("/api/voice/evaluate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        question: currentQ.question,
                        transcript: tData?.transcript || "",
                        duration: recordTime
                    })
                })

            const eData = await eRes.json()

            let txt = eData.raw
                .replace(/```json/gi, "")
                .replace(/```/g, "")

            txt =
                txt.substring(
                    txt.indexOf("{"),
                    txt.lastIndexOf("}") + 1
                )

            const parsed = JSON.parse(txt)

            updateSessionAfterAnswer({
                session,
                evaluation: parsed,
                skill: currentQ.skill
            })

            setSession({
                ...session,
                history: [...session.history],
                scores: [...session.scores]
            })

            if (isSessionOver(session)) {

                const report = completeSession(session)
                setFinalReport(report)
                setState(STATES.COMPLETED)
                return
            }

            await loadNext()

        } catch {
            setState(STATES.ERROR)
        }
    }

    /* ⭐ TIMER UI */

    const timeLeft = session
        ? Math.max(
            0,
            Math.floor(
                (session.startTime +
                    600000 -
                    Date.now()) /
                1000
            )
        )
        : 0

    /* ⭐ UI */

    return (
        <div className="h-screen bg-neutral-950 text-white flex flex-col items-center justify-center gap-10">

            <div className="text-sm opacity-60">
                Time Left: {timeLeft}s
            </div>

            <motion.div
                animate={{
                    scale: state === STATES.ASKING
                        ? [1, 1.08, 1]
                        : 1
                }}
                transition={{
                    repeat:
                        state === STATES.ASKING ? Infinity : 0,
                    duration: .9
                }}
                className="w-40 h-40 rounded-full bg-blue-500 flex items-center justify-center text-xl font-semibold"
            >
                AI
            </motion.div>

            <div className="text-center max-w-xl text-lg">
                {currentQ?.question}
            </div>

            {state === STATES.THINKING &&
                <div>Think… {thinking}</div>
            }

            {state === STATES.READY &&
                <button
                    onClick={startRecording}
                    className="px-6 py-3 bg-green-600 rounded-xl flex gap-2">
                    <Mic /> Start
                </button>
            }

            {state === STATES.RECORDING &&
                <button
                    onClick={stopRecording}
                    className="px-6 py-3 bg-red-600 rounded-xl flex gap-2">
                    <Square /> Stop ({recordTime}s)
                </button>
            }

            {state === STATES.PROCESSING &&
                <div className="text-yellow-400">
                    Evaluating...
                </div>
            }

            {state === STATES.COMPLETED &&
                <div className="text-center">
                    <div className="text-green-400 text-xl">
                        Interview Completed
                    </div>

                    <div className="mt-2">
                        Avg Score: {finalReport?.averageScore}
                    </div>
                </div>
            }

        </div>
    )
}