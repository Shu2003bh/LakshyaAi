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

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-50 via-white to-purple-50"></div>

      <div className="relative max-w-6xl mx-auto px-6 text-center">

        {/* Heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-tight">
          Your AI Career Coach for
          <br />
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Professional Success
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Advance your career with personalized guidance, interview preparation,
          and AI-powered tools that help you grow faster.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex justify-center gap-4 flex-wrap">

          <Link href="/dashboard">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl">
              Get Started
            </Button>
          </Link>

          <Button className="bg-white text-gray-800 border border-gray-200 px-8 py-3 rounded-xl shadow-sm hover:shadow-md hover:bg-gray-50 transition">
            Watch Demo
          </Button>
        </div>

        {/* Image */}
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

