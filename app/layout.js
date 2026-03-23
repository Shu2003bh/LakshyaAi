import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";

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
          className={`${inter.className} bg-gray-50 text-gray-900`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >

            <div className="sticky top-0 z-50">
              <Header />
            </div>

            <main className="min-h-screen relative">
              {children}
            </main>

            <footer className="bg-white border-t border-gray-200 py-12">
              <div className="max-w-6xl mx-auto text-center px-6 text-gray-600">
                <p>© 2024 Lakshya AI. All rights reserved.</p>
              </div>
            </footer>

          </ThemeProvider>

        </body>
      </html>
    </ClerkProvider>
  );
}