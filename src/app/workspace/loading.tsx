export default function WorkspaceLoading() {
  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="h-36 animate-pulse rounded-[2rem] border bg-white/70" />
        <div className="grid gap-4 xl:grid-cols-[290px_1fr]">
          <div className="space-y-4">
            <div className="h-80 animate-pulse rounded-[2rem] border bg-white/70" />
            <div className="h-64 animate-pulse rounded-[2rem] border bg-white/70" />
          </div>
          <div className="h-[44rem] animate-pulse rounded-[2rem] border bg-white/70" />
        </div>
      </div>
    </main>
  )
}
