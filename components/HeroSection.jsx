"use client"
import React, { useEffect, useRef } from 'react'
import Link from "next/link"
import { Button } from './button'
import Image from "next/image";


const HeroSection = () => {

    const imageref = useRef(null)

    useEffect(() => {
        const imageElement = imageref.current;

        const handleScroll = () =>{
        const scrollPosition = window.scrollY;
        const scrollThreshold = 100;

        if(scrollPosition>scrollThreshold){
            imageElement.classList.add("scrolled")
        }
    }

    window.addEventListener("scroll",handleScroll)
   
    }, [])
    

  return (
    <section className='w-full pt-36 md:pt-48 pb-10'>
    <div className='space-y-6 text-center'>
        <div className='space-y-6 mx-auto'>
            <h1 className='gradient-title text-5xl font-bold md:text-6xl lg:text-7xl xl:text-8xl'>
                Your AI Carrer Coach for
                <br />
                Professional Success
            </h1>
            <p className='mx-auto max-w-[600px] text-muted-foreground md:text-xl' >
                Advance your career with personalized guidance,interview perp, and AI-powered tools for job 
                success.
            </p>
        </div>

        <div className='flex justify-center space-x-4 pb-3'>
            
            <Link href='/dashboard'>
            <Button size='lg' className='px-8' >Get Started</Button>
            </Link>

            <Link href='/dashboard' >
            <Button variant='outline' size='lg' className='px-8' >Get Started</Button>
            </Link>

        </div>
    </div>

    <div className='hero-image-wrapper mt-5 md:mt-0'>
        <div ref={imageref} className='hero-image'>
            <Image
            src={"/banner3.jpeg"}
            width={1280}
            height={720}
            alt="Bannner LakshyaAi"
            className="rounded-lg shadow-2xl border mx-auto"
            priority
            
            />
        </div>
    </div>
    </section>
  )
}

export default HeroSection
