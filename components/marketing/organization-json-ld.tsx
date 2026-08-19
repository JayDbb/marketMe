import { appendFileSync } from 'node:fs'
import { join } from 'node:path'
import { siteConfig } from '@/lib/site'

export function OrganizationJsonLd() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: siteConfig.name,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: siteConfig.url,
    description: siteConfig.description,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  }

  // #region agent log
  const logPayload = {
    sessionId: "8110fe",
    runId: "post-fix",
    hypothesisId: "B",
    location: "components/marketing/organization-json-ld.tsx:render",
    message: "OrganizationJsonLd render",
    data: {
      isClient: typeof window !== "undefined",
      scriptType: "application/ld+json",
      insideThemeProvider: false,
    },
    timestamp: Date.now(),
  }
  try {
    appendFileSync(
      join(process.cwd(), "debug-8110fe.log"),
      JSON.stringify(logPayload) + "\n"
    )
  } catch {
    /* ignore log IO */
  }
  fetch("http://127.0.0.1:7751/ingest/39f00748-ada2-4c19-8c32-a6cb1b9e3c26", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "8110fe",
    },
    body: JSON.stringify(logPayload),
  }).catch(() => {})
  // #endregion

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
