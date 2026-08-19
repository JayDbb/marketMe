'use client'

import { useEffect } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from 'sonner'

// #region agent log
if (typeof window !== 'undefined') {
  fetch('http://127.0.0.1:7751/ingest/39f00748-ada2-4c19-8c32-a6cb1b9e3c26',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5e9746'},body:JSON.stringify({sessionId:'5e9746',runId:'pre-fix',hypothesisId:'C',location:'components/dashboard/dashboard-providers.tsx:module',message:'dashboard-providers client module evaluated',data:{href:window.location.pathname},timestamp:Date.now()})}).catch(()=>{});
  window.addEventListener('error', (event) => {
    fetch('http://127.0.0.1:7751/ingest/39f00748-ada2-4c19-8c32-a6cb1b9e3c26',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5e9746'},body:JSON.stringify({sessionId:'5e9746',runId:'pre-fix',hypothesisId:'A',location:'components/dashboard/dashboard-providers.tsx:window-error',message:'window error during dashboard load',data:{message:String(event.message??'').slice(0,400),filename:String(event.filename??'').split('/').pop()??'',isModuleFactory:String(event.message??'').includes('module factory'),mentionsUserPlus:String(event.message??'').includes('UserPlus')||String(event.message??'').includes('user-plus')},timestamp:Date.now()})}).catch(()=>{});
  })
}
// #endregion

export function DashboardProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // #region agent log
    const send = (hypothesisId: string, message: string, data: Record<string, unknown>) => {
      fetch('http://127.0.0.1:7751/ingest/39f00748-ada2-4c19-8c32-a6cb1b9e3c26',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5e9746'},body:JSON.stringify({sessionId:'5e9746',runId:'pre-fix',hypothesisId,location:'components/dashboard/dashboard-providers.tsx',message,data,timestamp:Date.now()})}).catch(()=>{});
    }
    send('C', 'dashboard providers mounted', {
      readyState: document.readyState,
      nextResourceCount: performance.getEntriesByType('resource').filter((e) => e.name.includes('/_next/')).length,
    })
    void navigator.serviceWorker?.getRegistrations().then((regs) => {
      send('E', 'service worker registrations', { count: regs.length, scopes: regs.map((r) => r.scope) })
    })
    const onError = (event: ErrorEvent) => {
      send('A', 'window error during dashboard load', {
        message: String(event.message ?? '').slice(0, 400),
        filename: String(event.filename ?? '').split('/').pop() ?? '',
        isModuleFactory: String(event.message ?? '').includes('module factory'),
        mentionsUserPlus: String(event.message ?? '').includes('UserPlus') || String(event.message ?? '').includes('user-plus'),
      })
    }
    window.addEventListener('error', onError)
    return () => window.removeEventListener('error', onError)
    // #endregion
  }, [])

  return (
    <TooltipProvider>
      {children}
      <Toaster richColors position="top-center" closeButton />
    </TooltipProvider>
  )
}
