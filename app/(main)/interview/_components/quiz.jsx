"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// This page now redirects to the new interview hub
export default function MockInterviewRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/interview");
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <span className="text-sm text-slate-400">Redirecting to Interview Hub...</span>
      </div>
    </div>
  );
}