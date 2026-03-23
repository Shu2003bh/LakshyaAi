"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Mic, Brain } from "lucide-react"

const roles = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "DSA Interview",
  "HR Behavioral",
]

export default function VoiceInterviewStartPage() {
  const router = useRouter()
  const [role, setRole] = useState("")

  const handleStart = () => {
    if (!role) {
      alert("Please select a role")
      return
    }

    console.log("VOICE INTERVIEW START:", role)

    router.push(`/voice-interview/session/demo?role=${encodeURIComponent(role)}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-xl shadow-xl">
        <CardHeader className="space-y-3 text-center">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-3 rounded-full">
              <Mic className="w-6 h-6 text-primary" />
            </div>
          </div>

          <CardTitle className="text-2xl font-bold">
            AI Voice Interview
          </CardTitle>

          <CardDescription>
            Practice real interview conversations. AI will ask questions in voice
            and evaluate your communication and clarity.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Select Interview Role
            </label>

            <Select onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Choose role" />
              </SelectTrigger>

              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            className="w-full h-11 text-base font-semibold"
            onClick={handleStart}
          >
            <Brain className="mr-2 h-4 w-4" />
            Start Voice Interview
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}