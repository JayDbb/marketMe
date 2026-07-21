import type { Metadata } from 'next'
import { siteConfig } from '@/lib/site'

type PageMetadataOptions = {
  title?: string
  description?: string
  path?: string
  noIndex?: boolean
}

export function createPageMetadata({
  title,
  description = siteConfig.description,
  path = '/',
  noIndex = false,
}: PageMetadataOptions = {}): Metadata {
  const pageTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.title
  const canonical = new URL(path, siteConfig.url).toString()

  return {
    title: pageTitle,
    description,
    metadataBase: new URL(siteConfig.url),
    alternates: { canonical },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: 'website',
      locale: siteConfig.locale,
      url: canonical,
      siteName: siteConfig.name,
      title: pageTitle,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
      creator: siteConfig.twitterHandle,
    },
    category: 'technology',
  }
}
