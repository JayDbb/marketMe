export interface BusinessProfile {
  id: string
  user_id: string
  business_name: string | null
  industry: string | null
  location: string | null
  website: string | null
  services: string | null
  usp: string | null
  primary_goal: string | null
  social_handle: string | null
  tone: string | null
  target_customers: string | null
  competitors: string | null
  channels: string[]
  created_at: string
  updated_at: string
  /**
   * @deprecated Legacy alias for `target_customers`.
   * Referenced by dashboard UI components — use `target_customers` in new code.
   */
  target_audience?: string | null
  /**
   * @deprecated Legacy alias for `tone`.
   * Referenced by dashboard UI components — use `tone` in new code.
   */
  brand_voice?: string | null
}

/** The fields the frontend sends when creating or updating a profile. */
export interface BusinessProfileInput {
  business_name?: string
  industry?: string
  location?: string
  website?: string
  services?: string
  usp?: string
  primary_goal?: string
  social_handle?: string
  tone?: string
  target_customers?: string
  competitors?: string
  channels?: string[]
}
