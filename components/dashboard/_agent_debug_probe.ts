'use client'

// #region agent log
fetch('http://127.0.0.1:7751/ingest/39f00748-ada2-4c19-8c32-a6cb1b9e3c26',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5e9746'},body:JSON.stringify({sessionId:'5e9746',runId:'post-fix',hypothesisId:'B',location:'components/dashboard/_agent_debug_probe.ts',message:'current user-nav module graph started after icon module split',data:{sourceImports:['CreditCard','LogOut','Settings'],userPlusInSource:false,lucideBarrelInUserNav:false},timestamp:Date.now()})}).catch(()=>{});
// #endregion
