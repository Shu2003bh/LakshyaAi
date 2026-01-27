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
<section className="relative w-full min-h-screen bg-black overflow-hidden pt-36 md:pt-48 pb-48">


      {/* Grid background */}
      <div className="grid-background absolute inset-0" />

      <div className="relative z-10 text-center space-y-8 max-w-6xl mx-auto px-4">
        {/* Heading */}
        <h1 className="text-5xl font-extrabold tracking-tight md:text-6xl lg:text-7xl xl:text-8xl">
          <span className="bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
            Your AI Career Coach for
          </span>
          <br />
          <span className="bg-gradient-to-b from-gray-200 to-gray-500 bg-clip-text text-transparent">
            Professional Success
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto max-w-[640px] text-gray-400 md:text-xl">
          Advance your career with personalized guidance, interview prep, and
          AI-powered tools for job success.
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-4">
          <Link href="/dashboard">
            <Button className="bg-white text-black hover:bg-gray-200 px-8 py-3 rounded-lg">
              Get Started
            </Button>
          </Link>

          <Link href="https://www.youtube.com/roadsidecoder" target="_blank">
            <Button
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-3 rounded-lg"
            >
              Watch Demo
            </Button>
          </Link>
        </div>

        {/* Image */}
        <div className="hero-image-wrapper mt-10 mb-32">
          <div ref={imageRef} className="hero-image">
            <Image
              src="/banner.jpeg"
              width={1280}
              height={720}
              alt="Dashboard Preview"
              className="rounded-xl border border-gray-800 shadow-2xl mx-auto"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
