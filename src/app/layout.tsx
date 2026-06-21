import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { Fraunces, IBM_Plex_Mono, Space_Grotesk } from "next/font/google"
import { Toaster } from "sonner"

import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css"

const sans = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
})

const heading = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
})

const mono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
})

export const metadata: Metadata = {
  title: "Lobiie",
  description:
    "Real-time community workspace with Clerk auth, Socket.IO presence, Zustand state, Prisma-backed persistence, and WebRTC rooms.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        data-scroll-behavior="smooth"
        className={`${sans.variable} ${heading.variable} ${mono.variable} h-full antialiased`}
      >
        <body className="min-h-full">
          <TooltipProvider>
            <div className="relative flex min-h-screen flex-col">{children}</div>
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
