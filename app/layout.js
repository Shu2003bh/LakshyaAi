import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
// import useSWR from 'swr'
// import { useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Lakshya AI - Your AI Companion",
  description: "",
};




export default function RootLayout({ children }) {
  
  return (
    <ClerkProvider>
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${inter.className}`}
        
      >
        
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange> 
    
          {/* Header */}
          <Header />
          <main className="min-h-screen">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-muted/50 py-12">
            <div className="container mx-auto text-center px-4 text-gray-200">
              <p>© 2024 Lakshya AI. All rights reserved.</p>
            </div>
          </footer>
         
         
        </ThemeProvider>
      </body>
    </html>
  </ClerkProvider>
  );
}
