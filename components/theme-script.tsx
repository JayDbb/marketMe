const THEME_INIT = `(function(){try{var t=localStorage.getItem("theme")||"dark";var d=t==="system"?window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light":t;var e=document.documentElement;e.classList.remove("light","dark");e.classList.add(d);e.style.colorScheme=d;}catch(n){}})();`

export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: THEME_INIT }}
      suppressHydrationWarning
    />
  )
}
