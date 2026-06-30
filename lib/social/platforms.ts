import type { SocialPlatform } from '@/types/social'

export const SOCIAL_PLATFORMS: {
  id: SocialPlatform
  label: string
  available: boolean
}[] = [
  { id: 'instagram', label: 'Instagram', available: true },
  { id: 'facebook', label: 'Facebook', available: false },
  { id: 'linkedin', label: 'LinkedIn', available: false },
  { id: 'twitter', label: 'X (Twitter)', available: false },
]
