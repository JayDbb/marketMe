export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center h-full min-h-screen relative z-10 w-full overflow-hidden text-white/40">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
        <p className="text-sm tracking-wide">Loading workspace...</p>
      </div>
    </div>
  )
}
