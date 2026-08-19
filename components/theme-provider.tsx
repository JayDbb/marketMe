"use client"

import * as React from "react"

type ResolvedTheme = "light" | "dark"

type ThemeContextValue = {
  theme: string | undefined
  setTheme: (theme: string) => void
  resolvedTheme: ResolvedTheme | undefined
  themes: string[]
  systemTheme: ResolvedTheme | undefined
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(
  undefined
)

const STORAGE_KEY = "theme"
const MEDIA = "(prefers-color-scheme: dark)"

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark"
  return window.matchMedia(MEDIA).matches ? "dark" : "light"
}

function applyThemeClass(resolved: ResolvedTheme) {
  const root = document.documentElement
  root.classList.remove("light", "dark")
  root.classList.add(resolved)
  root.style.colorScheme = resolved
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  enableSystem = true,
}: {
  children?: React.ReactNode
  defaultTheme?: string
  enableSystem?: boolean
  attribute?: string
  disableTransitionOnChange?: boolean
}) {
  const [theme, setThemeState] = React.useState<string | undefined>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || defaultTheme
    } catch {
      return defaultTheme
    }
  })
  const [systemTheme, setSystemTheme] = React.useState<ResolvedTheme | undefined>(() =>
    getSystemTheme()
  )

  React.useEffect(() => {
    if (!theme) return
    const resolved = theme === "system" ? getSystemTheme() : theme
    if (resolved === "light" || resolved === "dark") {
      applyThemeClass(resolved)
    }
  }, [theme, systemTheme])

  React.useEffect(() => {
    if (!enableSystem) return
    const mq = window.matchMedia(MEDIA)
    const onChange = () => setSystemTheme(getSystemTheme())
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [enableSystem])

  const setTheme = React.useCallback((next: string) => {
    setThemeState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* private mode */
    }
  }, [])

  const resolvedTheme: ResolvedTheme | undefined = !theme
    ? undefined
    : theme === "system"
      ? systemTheme
      : theme === "light" || theme === "dark"
        ? theme
        : undefined

  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
      resolvedTheme,
      themes: enableSystem ? ["light", "dark", "system"] : ["light", "dark"],
      systemTheme,
    }),
    [theme, setTheme, resolvedTheme, enableSystem, systemTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return (
    React.useContext(ThemeContext) ?? {
      theme: undefined,
      setTheme: () => {},
      resolvedTheme: undefined,
      themes: [] as string[],
      systemTheme: undefined,
    }
  )
}
