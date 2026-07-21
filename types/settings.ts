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
}
