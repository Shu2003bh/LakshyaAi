import { Suspense } from "react";
import { BarLoader } from "react-spinners";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-white text-black">

      <Suspense
        fallback={
          <div className="p-6">
            <BarLoader width={"100%"} color="#888" />
          </div>
        }
      >
        {children}
      </Suspense>

    </div>
  );
}