import type { AiProviderPreference } from '@/lib/ai-models'

export type WeekStartsOn = 'sunday' | 'monday'

<<<<<<< HEAD
=======
export type SignInMethod = 'google' | 'password' | 'magic_link'

>>>>>>> origin/development
export interface SettingsData {
  displayName: string
  email: string
  avatarUrl: string | null
<<<<<<< HEAD
  business: {
    businessName: string
    industry: string
    location: string
    website: string
    primaryGoal: string
=======
  auth: {
    methods: SignInMethod[]
    hasPassword: boolean
  }
  business: {
    businessName: string
    industry: string
    industryDetail: string
    location: string
    website: string
    primaryGoal: string
    competitors: string
    logoUrl: string | null
    brandColors: string[]
    primaryFont: string
    secondaryFont: string
>>>>>>> origin/development
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
