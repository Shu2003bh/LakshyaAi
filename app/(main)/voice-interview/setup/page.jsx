"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ROLES } from "@/lib/interview/config/roles"

export default function InterviewSetupPage() {

    const router = useRouter()

    const [role, setRole] = useState("fresher_mock")
    const [mode, setMode] = useState("fresher")
    const [duration, setDuration] = useState("standard")
    const [voice, setVoice] = useState("indian")

    const startInterview = () => {

        const config = { role, mode, duration, voice }

        const encoded =
            encodeURIComponent(JSON.stringify(config))

        router.push(`/voice-interview/session/demo?config=${encoded}`)
    }

    return (
        <div className="min-h-screen bg-gray-300">

            {/* TOP */}

            <div className="max-w-6xl mx-auto px-6 py-12">

                <h1 className="text-4xl font-bold text-gray-800">
                    LakshyaAI Mock Interview
                </h1>

                <p className="text-gray-500 mt-2">
                    Practice real AI voice interviews
                </p>

                {/* ROLE */}

                <section className="mt-10">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">
                        Choose Role
                    </h2>

                    <div className="grid grid-cols-3 gap-4">

                        {Object.entries(ROLES).map(([key, r]) => (

                            <button
                                key={key}
                                onClick={() => setRole(key)}
                                className={`
                h-12 rounded-xl border text-sm font-medium
                transition-all
                ${role === key
                                        ? "bg-blue-600 text-white border-blue-600 shadow"
                                        : "bg-white border-gray-200 hover:border-blue-400 hover:shadow-sm"
                                    }`}
                            >
                                {r.label}
                            </button>

                        ))}

                    </div>
                </section>

                {/* MODE */}

                <section className="mt-12">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">
                        Difficulty
                    </h2>

                    <div className="flex gap-3">

                        {["fresher", "intermediate", "advanced", "faang"]
                            .map(m => (

                                <button
                                    key={m}
                                    onClick={() => setMode(m)}
                                    className={`
                  px-5 h-10 rounded-xl text-sm font-medium border transition
                  ${mode === m
                                            ? "bg-green-600 text-white border-green-600"
                                            : "bg-white border-gray-200 hover:border-green-400"
                                        }`}
                                >
                                    {m}
                                </button>

                            ))}

                    </div>
                </section>

                {/* DURATION */}

                <section className="mt-12">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">
                        Interview Duration
                    </h2>

                    <div className="flex gap-3">

                        {[
                            { k: "quick", l: "5 min" },
                            { k: "standard", l: "10 min" },
                            { k: "focus", l: "15 min" },
                            { k: "deep", l: "30 min" }
                        ].map(d => (

                            <button
                                key={d.k}
                                onClick={() => setDuration(d.k)}
                                className={`
                px-5 h-10 rounded-xl text-sm font-medium border transition
                ${duration === d.k
                                        ? "bg-purple-600 text-white border-purple-600"
                                        : "bg-white border-gray-200 hover:border-purple-400"
                                    }`}
                            >
                                {d.l}
                            </button>

                        ))}

                    </div>
                </section>

                {/* VOICE */}

                <section className="mt-12">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">
                        Interviewer Style
                    </h2>

                    <div className="flex gap-3">

                        {["indian", "american", "formal", "mentor", "pressure"]
                            .map(v => (

                                <button
                                    key={v}
                                    onClick={() => setVoice(v)}
                                    className={`
                  px-5 h-10 rounded-xl text-sm font-medium border transition
                  ${voice === v
                                            ? "bg-orange-500 text-white border-orange-500"
                                            : "bg-white border-gray-200 hover:border-orange-400"
                                        }`}
                                >
                                    {v}
                                </button>

                            ))}

                    </div>
                </section>

                {/* START */}

                <div className="mt-16 flex justify-center">

                    <button
                        onClick={startInterview}
                        className="px-12 h-12 bg-blue-600 text-white 
            rounded-2xl font-semibold shadow hover:shadow-lg
            hover:scale-[1.02] transition"
                    >
                        Start Interview
                    </button>

                </div>

            </div>

        </div>
    )
}