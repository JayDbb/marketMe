import { appendFileSync } from "node:fs"
import { join } from "node:path"

const THEME_INIT = `(function(){try{var t=localStorage.getItem("theme")||"dark";var d=t==="system"?window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light":t;var e=document.documentElement;e.classList.remove("light","dark");e.classList.add(d);e.style.colorScheme=d;}catch(n){}})();`

export function ThemeScript() {
  // #region agent log
  try {
    appendFileSync(
      join(process.cwd(), "debug-8110fe.log"),
      JSON.stringify({
        sessionId: "8110fe",
        runId: "post-fix",
        hypothesisId: "A",
        location: "components/theme-script.tsx:render",
        message: "Server ThemeScript render",
        data: {
          isClient: typeof window !== "undefined",
          scriptKind: "blocking-inline",
        },
        timestamp: Date.now(),
      }) + "\n"
    )
  } catch {
    /* ignore log IO */
  }
  // #endregion

  return (
    <script
      dangerouslySetInnerHTML={{ __html: THEME_INIT }}
      suppressHydrationWarning
    />
  )
}
