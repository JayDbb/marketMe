export default function DashboardLoading() {
  return (
    <div
      className="dashboard-canvas relative z-10 mx-auto w-full max-w-6xl px-6 py-10"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading workspace…</span>
      <div className="mb-8 flex flex-col gap-3">
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="h-8 w-64 max-w-full rounded bg-muted" />
        <div className="h-4 w-80 max-w-full rounded bg-muted" />
      </div>
      <div className="mb-6 h-18 rounded-2xl border border-border bg-card" />
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="h-28 rounded-2xl border border-border bg-card sm:col-span-2" />
        <div className="h-28 rounded-2xl border border-border bg-card" />
        <div className="h-28 rounded-2xl border border-border bg-card" />
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="h-64 rounded-2xl border border-border bg-card lg:col-span-2" />
        <div className="h-64 rounded-2xl border border-border bg-card" />
      </div>
    </div>
  )
}
