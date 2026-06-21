import Link from "next/link"
import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.22),transparent_30%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_28%)]" />
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_auto]">
        <div className="rounded-[2rem] border border-white/60 bg-white/70 p-8 shadow-[0_20px_80px_-50px_rgba(15,23,42,0.45)] backdrop-blur">
          <Link href="/" className="text-sm uppercase tracking-[0.28em] text-muted-foreground">
            Lobiie
          </Link>
          <h1 className="mt-4 font-heading text-5xl leading-none text-foreground">
            Create your space.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            Spin up the MVP, authenticate with Clerk, and step into a community
            workspace with text, voice, and video collaboration already wired.
          </p>
        </div>
        <div className="mx-auto">
          <SignUp forceRedirectUrl="/workspace" signInUrl="/sign-in" />
        </div>
      </div>
    </main>
  )
}
