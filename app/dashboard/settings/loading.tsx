export default function SettingsLoading() {
  return (
    <div
      className="relative z-10 mx-auto w-full max-w-6xl px-6 py-10"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading settings…</span>
      <div className="mb-10 flex flex-col gap-2">
        <div className="h-3 w-20 rounded bg-muted" />
        <div className="h-8 w-40 rounded bg-muted" />
        <div className="h-4 w-72 max-w-full rounded bg-muted" />
      </div>
      <div className="flex flex-col gap-10 lg:flex-row">
        <div className="flex w-full shrink-0 flex-col gap-6 lg:w-64">
          <div className="h-24 rounded-2xl border border-border bg-card" />
          <div className="h-12 rounded-2xl border border-border bg-card" />
          <div className="h-24 rounded-2xl border border-border bg-card" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="h-40 rounded-2xl border border-border bg-card" />
          <div className="h-56 rounded-2xl border border-border bg-card" />
        </div>
      </div>
    </div>
  )
}
