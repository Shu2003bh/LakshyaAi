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
    <section className="relative w-full pt-36 pb-28 overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-50 via-white to-purple-50"></div>

      <div className="relative max-w-7xl mx-auto px-6 text-center">

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

          <Button
            variant="outline"
            className="border-gray-300 px-8 py-3 rounded-xl"
          >
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

      {/* ⭐ Section Divider */}
      <div className="mt-24 h-[2px] w-full bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-60"></div>

    </section>
  );
};

export default HeroSection;