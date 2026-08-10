import type { AiProviderPreference } from '@/lib/ai-models'

export type WeekStartsOn = 'sunday' | 'monday'

export interface SettingsData {
  displayName: string
  email: string
  avatarUrl: string | null
  business: {
    businessName: string
    industry: string
    location: string
    website: string
    primaryGoal: string
    hasProfile: boolean
  }
  preferences: {
    timezone: string
    weekStartsOn: WeekStartsOn
  }
  ai: {
    aiProvider: AiProviderPreference
    captionModel: string
    imageModel: string
  }
}
