import Link from "next/link"
import { auth } from "@clerk/nextjs/server"
import {
  ArrowRightIcon,
  AudioLinesIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UsersIcon,
  VideoIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const features = [
  {
    title: "Realtime messaging",
    description:
      "Persisted room messages backed by Prisma and mirrored instantly over Socket.IO.",
    icon: SparklesIcon,
  },
  {
    title: "Voice and video rooms",
    description:
      "Browser-native calls with WebRTC peer connections and websocket signaling.",
    icon: VideoIcon,
  },
  {
    title: "Secure team access",
    description:
      "Clerk authentication plus role-aware server checks for protected actions.",
    icon: ShieldCheckIcon,
  },
]

const stack = [
  "Next.js",
  "shadcn/ui",
  "Clerk",
  "Socket.IO",
  "Zustand",
  "Prisma",
  "SQLite",
  "WebRTC",
  "Tailwind CSS",
]

export default async function Home() {
  const session = await auth()
  const primaryHref = session.userId ? "/workspace" : "/sign-up"
  const secondaryHref = session.userId ? "/workspace" : "/sign-in"

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.22),transparent_34%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.16),transparent_28%)]" />
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-full border border-white/60 bg-white/75 px-4 py-3 shadow-[0_20px_80px_-50px_rgba(15,23,42,0.45)] backdrop-blur">
          <Link href="/" className="font-heading text-2xl text-foreground">
            Lobiie
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href={secondaryHref}
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              {session.userId ? "Open app" : "Sign in"}
            </Link>
            <Link
              href={primaryHref}
              className={cn(buttonVariants({ size: "sm" }))}
            >
              {session.userId ? "Go to workspace" : "Start building"}
            </Link>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-8 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <div>
            <Badge variant="outline" className="mb-5">
              Community platform MVP
            </Badge>
            <h1 className="max-w-4xl font-heading text-5xl leading-[0.94] text-foreground sm:text-6xl lg:text-7xl">
              Build the real-time workspace from your project idea, not just the pitch.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Lobiie is wired for text, voice, and video collaboration with
              secure auth, channel structure, role-aware access, Zustand client
              state, and a Prisma-backed message layer.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {stack.map((item) => (
                <Badge key={item} variant="secondary" className="rounded-full px-3 py-1">
                  {item}
                </Badge>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href={primaryHref} className={cn(buttonVariants({ size: "lg" }))}>
                Open the MVP
                <ArrowRightIcon />
              </Link>
              <Link
                href={secondaryHref}
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              >
                {session.userId ? "Stay in app" : "Use Clerk auth"}
              </Link>
            </div>
          </div>

          <Card className="overflow-hidden bg-card/80 shadow-[0_20px_80px_-50px_rgba(15,23,42,0.45)] backdrop-blur">
            <CardHeader className="border-b bg-gradient-to-br from-amber-200/40 via-transparent to-sky-200/30">
              <CardTitle className="text-2xl">What&apos;s already implemented</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {features.map((feature) => {
                const Icon = feature.icon

                return (
                  <div
                    key={feature.title}
                    className="rounded-[1.75rem] border bg-background/70 p-5"
                  >
                    <div className="mb-3 inline-flex rounded-full bg-primary/10 p-3 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <h2 className="font-medium">{feature.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                )
              })}
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.5rem] border bg-background/70 p-4">
                  <AudioLinesIcon className="mb-3 size-5 text-primary" />
                  <p className="text-sm font-medium">Voice</p>
                </div>
                <div className="rounded-[1.5rem] border bg-background/70 p-4">
                  <VideoIcon className="mb-3 size-5 text-primary" />
                  <p className="text-sm font-medium">Video</p>
                </div>
                <div className="rounded-[1.5rem] border bg-background/70 p-4">
                  <UsersIcon className="mb-3 size-5 text-primary" />
                  <p className="text-sm font-medium">Community</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}
