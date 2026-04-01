import { BarLoader } from "react-spinners";
import { Suspense } from "react";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <BarLoader width={200} color="#6366f1" />
            <p className="text-sm text-slate-400 animate-pulse">
              Loading your dashboard…
            </p>
          </div>
        }
      >
        {children}
      </Suspense>
    </div>
  );
}