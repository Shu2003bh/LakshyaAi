// import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
// import React from 'react'
// import Link from 'next/link';
// import Image from 'next/image';
// import { Button } from './ui/button';
// import { FileText, GraduationCapIcon, LayoutDashboard, LucidePenBox } from 'lucide-react';
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
// import { StarsIcon } from 'lucide-react';
// import { ChevronDown } from 'lucide-react';
// import { FileTextIcon } from 'lucide-react';
// import { PenBoxIcon } from 'lucide-react';
// import { checkUser } from '@/lib/checkUser';
// const Chevron = ChevronDown;

// const Header = async() => {
//   await checkUser();
//   return (

//     <header className='fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 supports-[backdrop-filter]:bg-background/60'>
//       <nav className="container mx-auto px-4  h-16 flex items-center justify-between ">

//         <Link href="/">
//           <Image className="h-40 py-1 w-auto object-contain" src="/logo.png" alt="Lakshya AI Logo" width={150} height={60} />
//         </Link>

//         <div className='flex items-center space-x-2 md:space-x-4'>
//           <SignedIn>
//             <Link href={"/dashboard"}>
//               <Button variant="outline">
//                 <LayoutDashboard className="" />
//                 <span className='hidden md:block'>Industry Insights</span>

//               </Button>


//             </Link>



//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button>
//                   <StarsIcon className="h-4 w-4" />
//                   <span className='hidden md:block'>Growth Tools</span>
//                   <Chevron className="h-4 w-4" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent>
//                 <DropdownMenuItem>
//                   <Link href={'/resume'} className="flex items-center gap-2px">
//                     <FileTextIcon className='h-4 w-4' />
//                     Build Resume
//                   </Link>
//                 </DropdownMenuItem>
//                 <DropdownMenuItem>
//                   <Link href={'/ai-cover-letter'} className="flex items-center gap-2px">
//                     <PenBoxIcon className='h-4 w-4' />
//                     Cover Letter
//                   </Link>
//                 </DropdownMenuItem>
//                 <DropdownMenuItem>
//                   <Link href={'/interview'} className="flex items-center gap-2px">
//                     <GraduationCapIcon className='h-4 w-4' />
//                     Interview Prep
//                   </Link>
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </SignedIn>



//           <SignedOut>
//             <SignInButton>
//               <Button variant="outline">
//                 Sign In
//               </Button>
//             </SignInButton>
//           </SignedOut>
//           <SignedIn>
//             <UserButton
//               appearance={{
//                 elements: {
//                   avatarBox: "w-10 h-10",
//                   userButtonPopoverCard: "w-10 h-10",
//                   userPreviewMainIdentifier: "font-semibold"
//                 }
//               }} />
//           </SignedIn>
//         </div>
//       </nav>
//     </header>

//   )
// }

// export default Header
// import {
//   SignedIn,
//   SignedOut,
//   SignInButton,
//   UserButton,
// } from "@clerk/nextjs";
// import Link from "next/link";
// import Image from "next/image";
// import { Button } from "./ui/button";
// import {
//   LayoutDashboard,
//   StarsIcon,
//   ChevronDown,
//   FileTextIcon,
//   PenBoxIcon,
//   GraduationCapIcon,
//   Target,
// } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "./ui/dropdown-menu";
// import { checkUser } from "@/lib/checkUser";

// const Header = async () => {
//   await checkUser();

//   return (
//     <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
//       <nav className="container mx-auto flex h-16 items-center justify-between px-4">
//         {/* Logo */}
//         <Link href="/">
//           <Image
//             src="/logo.png"
//             alt="Lakshya AI Logo"
//             width={180}
//             height={60}
//             className="w-auto object-contain"
//             priority
//           />
//         </Link>

//         {/* Right actions */}
//         <div className="flex items-center gap-2 md:gap-4">
//           <SignedIn>
//             <Link href="/dashboard">
//               <Button variant="outline" className="gap-2">
//                 <LayoutDashboard className="h-4 w-4" />
//                 <span className="hidden md:inline">Industry Insights</span>
//               </Button>
//             </Link>

//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button className="gap-2">
//                   <StarsIcon className="h-4 w-4" />
//                   <span className="hidden md:inline">Growth Tools</span>
//                   <ChevronDown className="h-4 w-4" />
//                 </Button>
//               </DropdownMenuTrigger>

//               <DropdownMenuContent align="end">

//                 <DropdownMenuItem asChild>
//                   <Link href="/career-test" className="flex items-center gap-2">
//                     <Target className="h-4 w-4" />
//                     Career Discovery
//                   </Link>
//                 </DropdownMenuItem>

//                 <DropdownMenuItem asChild>
//                   <Link href="/resume" className="flex items-center gap-2">
//                     <FileTextIcon className="h-4 w-4" />
//                     Build Resume
//                   </Link>
//                 </DropdownMenuItem>

//                 <DropdownMenuItem asChild>
//                   <Link href="/ai-cover-letter" className="flex items-center gap-2">
//                     <PenBoxIcon className="h-4 w-4" />
//                     Cover Letter
//                   </Link>
//                 </DropdownMenuItem>

//                 <DropdownMenuItem asChild>
//                   <Link href="/interview" className="flex items-center gap-2">
//                     <GraduationCapIcon className="h-4 w-4" />
//                     Interview Prep
//                   </Link>
//                 </DropdownMenuItem>

//               </DropdownMenuContent>
//             </DropdownMenu>
//           </SignedIn>

//           <SignedOut>
//             <SignInButton>
//               <Button variant="outline">Sign In</Button>
//             </SignInButton>
//           </SignedOut>

//           <SignedIn>
//             <UserButton
//               appearance={{
//                 elements: {
//                   avatarBox: "h-9 w-9",
//                   userPreviewMainIdentifier: "font-semibold",
//                 },
//               }}
//             />
//           </SignedIn>
//         </div>
//       </nav>
//     </header>
//   );
// };

// export default Header;


import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";

import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";

import {
  LayoutDashboard,
  StarsIcon,
  ChevronDown,
  FileTextIcon,
  PenBoxIcon,
  GraduationCapIcon,
  Target,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import { checkUser } from "@/lib/checkUser";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const Header = async () => {
  await checkUser();

  return (

    <header className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">

      <nav className="flex h-16 w-full items-center justify-between px-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">

          <Image
            src="/logo3.png"
            alt="Lakshya AI Logo"
            width={120}
            height={40}
            className="object-contain"
            priority
          />

          {/* <span className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Lakshya AI
        </span> */}

        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-3">

          <SignedIn>

            {/* Industry Insights */}
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="w-full bg-white border border-dashed border-gray-300 text-gray-700 hover:bg-indigo-50 hover:border-indigo-400 hover:text-indigo-700 transition"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden md:inline">
                  Industry Insights
                </span>
              </Button>
            </Link>

            {/* Growth Tools */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>

                <Button className="gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90">

                  <StarsIcon className="h-4 w-4" />

                  <span className="hidden md:inline">
                    Growth Tools
                  </span>

                  <ChevronDown className="h-4 w-4" />

                </Button>

              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-56 bg-white text-gray-700 border border-gray-200 shadow-lg rounded-lg"
              >

                <DropdownMenuItem
                  asChild
                  className="cursor-pointer text-gray-700 
  hover:bg-indigo-50 hover:text-indigo-700 
  focus:bg-indigo-50 focus:text-indigo-700
  data-[highlighted]:bg-indigo-50 data-[highlighted]:text-indigo-700"
                >
                  <Link href="/career-test" className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Career Discovery
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  asChild
                  className="cursor-pointer text-gray-700 
  hover:bg-indigo-50 hover:text-indigo-700 
  focus:bg-indigo-50 focus:text-indigo-700
  data-[highlighted]:bg-indigo-50 data-[highlighted]:text-indigo-700"
                >
                  <Link href="/resume" className="flex items-center gap-2">
                    <FileTextIcon className="h-4 w-4" />
                    Build Resume
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  asChild
                  className="cursor-pointer text-gray-700 
  hover:bg-indigo-50 hover:text-indigo-700 
  focus:bg-indigo-50 focus:text-indigo-700
  data-[highlighted]:bg-indigo-50 data-[highlighted]:text-indigo-700"
                >
                  <Link href="/ai-cover-letter" className="flex items-center gap-2">
                    <PenBoxIcon className="h-4 w-4" />
                    Cover Letter
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  asChild
                  className="cursor-pointer text-gray-700 
  hover:bg-indigo-50 hover:text-indigo-700 
  focus:bg-indigo-50 focus:text-indigo-700
  data-[highlighted]:bg-indigo-50 data-[highlighted]:text-indigo-700"
                >
                  <Link href="/interview" className="flex items-center gap-2">
                    <GraduationCapIcon className="h-4 w-4" />
                    Interview Prep
                  </Link>
                </DropdownMenuItem>

              </DropdownMenuContent>
            </DropdownMenu>

          </SignedIn>

          {/* Signed Out */}
          <SignedOut>
            <SignInButton>
              <Button
                variant="outline"
                className="rounded-xl border-gray-200 hover:bg-gray-100"
              >
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>

          {/* User Avatar */}
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9",
                  userPreviewMainIdentifier: "font-semibold",
                },
              }}
            />
          </SignedIn>

        </div>

      </nav>
    </header>
  );
}

export default Header;
