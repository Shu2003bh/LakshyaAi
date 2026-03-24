"use client";
// "use client";

// import React, { useEffect, useRef } from "react";
// import Image from "next/image";
// import { Button } from "@/components/ui/button";
// import Link from "next/link";

// const HeroSection = () => {
//   const imageRef = useRef(null);

//   useEffect(() => {
//     const handleScroll = () => {
//       if (!imageRef.current) return;
//       if (window.scrollY > 100) {
//         imageRef.current.classList.add("scrolled");
//       } else {
//         imageRef.current.classList.remove("scrolled");
//       }
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   return (
// <section className="relative w-full min-h-screen bg-black overflow-hidden pt-36 md:pt-48 pb-48">


//       {/* Grid background */}
//       <div className="grid-background absolute inset-0" />

//       <div className="relative z-10 text-center space-y-8 max-w-6xl mx-auto px-4">
//         {/* Heading */}
//         <h1 className="text-5xl font-extrabold tracking-tight md:text-6xl lg:text-7xl xl:text-8xl">
//           <span className="bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
//             Your AI Career Coach for
//           </span>
//           <br />
//           <span className="bg-gradient-to-b from-gray-200 to-gray-500 bg-clip-text text-transparent">
//             Professional Success
//           </span>
//         </h1>

//         {/* Subtitle */}
//         <p className="mx-auto max-w-[640px] text-gray-400 md:text-xl">
//           Advance your career with personalized guidance, interview prep, and
//           AI-powered tools for job success.
//         </p>

//         {/* Buttons */}
//         <div className="flex justify-center gap-4">
//           <Link href="/dashboard">
//             <Button className="bg-white text-black hover:bg-gray-200 px-8 py-3 rounded-lg">
//               Get Started
//             </Button>
//           </Link>

//           <Link href="" target="_blank">
//             <Button
//               variant="outline"
//               className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-3 rounded-lg"
//             >
//               Watch Demo
//             </Button>
//           </Link>
//         </div>

//         {/* Image */}
//         <div className="hero-image-wrapper mt-10 mb-32">
//           <div ref={imageRef} className="hero-image">
//             <Image
//               src="/banner.jpeg"
//               width={1280}
//               height={720}
//               alt="Dashboard Preview"
//               className="rounded-xl border border-gray-800 shadow-2xl mx-auto"
//               priority
//             />
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default HeroSection;


"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mic, ArrowRight } from "lucide-react";

const HeroSection = () => {
  const imageRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!imageRef.current) return;
      if (window.scrollY > 100) {
        imageRef.current.classList.add("scrolled");
      } else {
        imageRef.current.classList.remove("scrolled");
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative w-full pt-32 pb-20 overflow-hidden">

      {/* Background — same as before */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-50 via-white to-purple-50" />

      <div className="relative max-w-6xl mx-auto px-6 text-center">

        {/* ── Live badge (new) ── */}
        <div className="inline-flex items-center gap-2 mb-6
                        bg-indigo-50 border border-indigo-200
                        text-indigo-600 text-xs font-semibold
                        px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          AI Mock Interviews Now Live
        </div>

        {/* Heading — same as before */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight
                       text-gray-900 leading-tight">
          Your AI Career Coach for
          <br />
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600
                           bg-clip-text text-transparent">
            Professional Success
          </span>
        </h1>

        {/* Subtitle — same as before */}
        <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Advance your career with personalized guidance, interview preparation,
          and AI-powered tools that help you grow faster.
        </p>

        {/* ── Buttons — Mock Interview added as primary CTA ── */}
        <div className="mt-8 flex justify-center gap-3 flex-wrap">

          {/* ⭐ PRIMARY — Mock Interview */}
          <Link href="/voice-interview/setup">
            <button className="
              inline-flex items-center gap-2
              bg-indigo-600 hover:bg-indigo-700
              text-white font-semibold text-sm
              px-6 py-3 rounded-xl
              shadow-lg shadow-indigo-200 hover:shadow-indigo-300
              active:scale-[0.97]
              transition-all duration-150
            ">
              <Mic size={15} />
              Try Mock Interview
              <ArrowRight size={14} />
            </button>
          </Link>

          {/* Get Started */}
          <Link href="/dashboard">
            <Button className="bg-white text-gray-800 border border-gray-200
                               px-6 py-3 rounded-xl shadow-sm
                               hover:shadow-md hover:bg-gray-50 transition">
              Get Started
            </Button>
          </Link>

          {/* Watch Demo */}
          <Button className="bg-white text-gray-800 border border-gray-200
                             px-6 py-3 rounded-xl shadow-sm
                             hover:shadow-md hover:bg-gray-50 transition">
            Watch Demo
          </Button>

        </div>

        {/* Social proof (new) */}
        <p className="mt-4 text-xs text-gray-400">
          No signup needed to try · 5-min quick round available
        </p>

        {/* Image — exactly same as before */}
        <div className="mt-16 hero-image-wrapper">
          <div ref={imageRef} className="hero-image">
            <Image
              src="/banner.jpeg"
              width={1200}
              height={700}
              alt="Dashboard Preview"
              className="rounded-2xl shadow-xl border border-gray-200 mx-auto"
              priority
            />
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;