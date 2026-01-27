import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import React from 'react'
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../button';
import { FileText, GraduationCapIcon, LayoutDashboard, LucidePenBox } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../dropdown-menu';
import { StarsIcon } from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import { FileTextIcon } from 'lucide-react';
import { PenBoxIcon } from 'lucide-react';
const Chevron = ChevronDown;

const Header = () => {
  return (

    <header className='fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 supports-[backdrop-filter]:bg-background/60'>
      <nav className="container mx-auto px-4  h-16 flex items-center justify-between ">

        <Link href="/">
          <Image className="h-40 py-1 w-auto object-contain" src="/logo.png" alt="Lakshya AI Logo" width={150} height={60} />
        </Link>

        <div className='flex items-center space-x-2 md:space-x-4'>
          <SignedIn>
            <Link href={"/dashboard"}>
              <Button variant="outline">
                <LayoutDashboard className="" />
                <span className='hidden md:block'>Industry Insights</span>

              </Button>


            </Link>



            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <StarsIcon className="h-4 w-4" />
                  <span className='hidden md:block'>Growth Tools</span>
                  <Chevron className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Link href={'/resume'} className="flex items-center gap-2px">
                    <FileTextIcon className='h-4 w-4' />
                    Build Resume
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href={'/ai-cover-letter'} className="flex items-center gap-2px">
                    <PenBoxIcon className='h-4 w-4' />
                    Cover Letter
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href={'/interview'} className="flex items-center gap-2px">
                    <GraduationCapIcon className='h-4 w-4' />
                    Interview Prep
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SignedIn>



          <SignedOut>
            <SignInButton>
              <Button variant="outline">
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                  userButtonPopoverCard: "w-10 h-10",
                  userPreviewMainIdentifier: "font-semibold"
                }
              }} />
          </SignedIn>
        </div>
      </nav>
    </header>

  )
}

export default Header
