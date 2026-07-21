export default function SettingsLoading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh] relative z-10 w-full text-muted-foreground">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-border border-t-foreground/70 animate-spin" />
        <p className="text-sm tracking-wide">Loading settings...</p>
      </div>
    </div>
  )
}
