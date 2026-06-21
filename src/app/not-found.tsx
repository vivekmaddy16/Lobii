import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="rounded-[2rem] border border-white/60 bg-white/75 p-10 text-center shadow-[0_20px_80px_-50px_rgba(15,23,42,0.45)] backdrop-blur">
        <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">
          404
        </p>
        <h1 className="mt-4 font-heading text-5xl text-foreground">
          This room does not exist.
        </h1>
        <p className="mt-4 max-w-md text-base leading-7 text-muted-foreground">
          The route you requested is missing or your workspace data has not been created yet.
        </p>
        <Link
          href="/workspace"
          className={cn(buttonVariants({ size: "lg" }), "mt-8 inline-flex")}
        >
          Back to workspace
        </Link>
      </div>
    </main>
  )
}
