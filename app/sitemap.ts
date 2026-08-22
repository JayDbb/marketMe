import type { MetadataRoute } from 'next'
import { getAllBlogPosts } from '@/lib/blog-posts'
import { marketingRoutes, siteConfig } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  const marketing = marketingRoutes.map((route) => ({
    url: `${siteConfig.url}${route === '/' ? '' : route}`,
    lastModified,
    changeFrequency: (route === '/' ? 'weekly' : 'monthly') as 'weekly' | 'monthly',
    priority: route === '/' ? 1 : 0.7,
  }))

  const posts = getAllBlogPosts().map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...marketing, ...posts]
}
