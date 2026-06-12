export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string
          name: string | null
          email: string | null
          role: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          name?: string | null
          email?: string | null
          role?: string | null
          created_at?: string
        }
        Update: {
          user_id?: string
          name?: string | null
          email?: string | null
          role?: string | null
          created_at?: string
        }
      }
      business: {
        Row: {
          business_id: number
          business_name: string
          business_type: string | null
          location: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          business_name: string
          business_type?: string | null
          location?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          business_name?: string
          business_type?: string | null
          location?: string | null
          description?: string | null
          created_at?: string
        }
      }
      business_user: {
        Row: {
          b_user_id: number
          user_id: string | null
          business_id: number | null
          access_level: string | null
        }
        Insert: {
          user_id?: string | null
          business_id?: number | null
          access_level?: string | null
        }
        Update: {
          user_id?: string | null
          business_id?: number | null
          access_level?: string | null
        }
      }
      social_account: {
        Row: {
          account_id: number
          business_id: number | null
          platform: string
          handle: string | null
          account_url: string | null
          connected_status: boolean
        }
        Insert: {
          business_id?: number | null
          platform: string
          handle?: string | null
          account_url?: string | null
          connected_status?: boolean
        }
        Update: {
          business_id?: number | null
          platform?: string
          handle?: string | null
          account_url?: string | null
          connected_status?: boolean
        }
      }
      marketing_strategy: {
        Row: {
          strategy_id: number
          business_id: number | null
          strategy_name: string
          strategy_type: string | null
          description: string | null
          goal: string | null
          status: string | null
          created_at: string
        }
        Insert: {
          business_id?: number | null
          strategy_name: string
          strategy_type?: string | null
          description?: string | null
          goal?: string | null
          status?: string | null
          created_at?: string
        }
        Update: {
          business_id?: number | null
          strategy_name?: string
          strategy_type?: string | null
          description?: string | null
          goal?: string | null
          status?: string | null
          created_at?: string
        }
      }
      content_schedule: {
        Row: {
          schedule_id: number
          business_id: number | null
          strategy_id: number | null
          week_start_date: string | null
          week_end_date: string | null
          schedule_status: string | null
          created_at: string
        }
        Insert: {
          business_id?: number | null
          strategy_id?: number | null
          week_start_date?: string | null
          week_end_date?: string | null
          schedule_status?: string | null
          created_at?: string
        }
        Update: {
          business_id?: number | null
          strategy_id?: number | null
          week_start_date?: string | null
          week_end_date?: string | null
          schedule_status?: string | null
          created_at?: string
        }
      }
      content_idea: {
        Row: {
          idea_id: number
          business_id: number | null
          title: string | null
          description: string | null
          content_type: string | null
          status: string | null
          generated_at: string
        }
        Insert: {
          business_id?: number | null
          title?: string | null
          description?: string | null
          content_type?: string | null
          status?: string | null
          generated_at?: string
        }
        Update: {
          business_id?: number | null
          title?: string | null
          description?: string | null
          content_type?: string | null
          status?: string | null
          generated_at?: string
        }
      }
      post: {
        Row: {
          post_id: number
          business_id: number | null
          account_id: number | null
          idea_id: number | null
          schedule_id: number | null
          caption: string | null
          media_url: string | null
          scheduled_date: string | null
          status: string | null
        }
        Insert: {
          business_id?: number | null
          account_id?: number | null
          idea_id?: number | null
          schedule_id?: number | null
          caption?: string | null
          media_url?: string | null
          scheduled_date?: string | null
          status?: string | null
        }
        Update: {
          business_id?: number | null
          account_id?: number | null
          idea_id?: number | null
          schedule_id?: number | null
          caption?: string | null
          media_url?: string | null
          scheduled_date?: string | null
          status?: string | null
        }
      }
      generated_asset: {
        Row: {
          asset_id: number
          post_id: number | null
          asset_type: string | null
          file_url: string | null
          created_at: string
        }
        Insert: {
          post_id?: number | null
          asset_type?: string | null
          file_url?: string | null
          created_at?: string
        }
        Update: {
          post_id?: number | null
          asset_type?: string | null
          file_url?: string | null
          created_at?: string
        }
      }
      post_analytics: {
        Row: {
          analytics_id: number
          post_id: number | null
          likes: number | null
          comments: number | null
          shares: number | null
          views: number | null
          reach: number | null
          engagement_rate: number | null
        }
        Insert: {
          post_id?: number | null
          likes?: number | null
          comments?: number | null
          shares?: number | null
          views?: number | null
          reach?: number | null
          engagement_rate?: number | null
        }
        Update: {
          post_id?: number | null
          likes?: number | null
          comments?: number | null
          shares?: number | null
          views?: number | null
          reach?: number | null
          engagement_rate?: number | null
        }
      }
      customer_engagement: {
        Row: {
          engagement_id: number
          business_id: number | null
          post_id: number | null
          customer_name: string | null
          engagement_type: string | null
          response_status: string | null
          created_at: string
        }
        Insert: {
          business_id?: number | null
          post_id?: number | null
          customer_name?: string | null
          engagement_type?: string | null
          response_status?: string | null
          created_at?: string
        }
        Update: {
          business_id?: number | null
          post_id?: number | null
          customer_name?: string | null
          engagement_type?: string | null
          response_status?: string | null
          created_at?: string
        }
      }
      customer_inquiry: {
        Row: {
          inquiry_id: number
          business_id: number | null
          post_id: number | null
          customer_name: string | null
          message: string | null
          inquiry_type: string | null
          suggested_response: string | null
          response_status: string | null
          created_at: string
          responded_at: string | null
        }
        Insert: {
          business_id?: number | null
          post_id?: number | null
          customer_name?: string | null
          message?: string | null
          inquiry_type?: string | null
          suggested_response?: string | null
          response_status?: string | null
          created_at?: string
          responded_at?: string | null
        }
        Update: {
          business_id?: number | null
          post_id?: number | null
          customer_name?: string | null
          message?: string | null
          inquiry_type?: string | null
          suggested_response?: string | null
          response_status?: string | null
          created_at?: string
          responded_at?: string | null
        }
      }
      analytics_report: {
        Row: {
          report_id: number
          account_id: number | null
          report_period: string | null
          total_posts: number | null
          total_engagements: number | null
          average_engagement_rate: number | null
          generated_at: string
        }
        Insert: {
          account_id?: number | null
          report_period?: string | null
          total_posts?: number | null
          total_engagements?: number | null
          average_engagement_rate?: number | null
          generated_at?: string
        }
        Update: {
          account_id?: number | null
          report_period?: string | null
          total_posts?: number | null
          total_engagements?: number | null
          average_engagement_rate?: number | null
          generated_at?: string
        }
      }
      recommendation: {
        Row: {
          recommendation_id: number
          report_id: number | null
          recommendation_type: string | null
          description: string | null
          priority_level: string | null
          status: string | null
          created_at: string
        }
        Insert: {
          report_id?: number | null
          recommendation_type?: string | null
          description?: string | null
          priority_level?: string | null
          status?: string | null
          created_at?: string
        }
        Update: {
          report_id?: number | null
          recommendation_type?: string | null
          description?: string | null
          priority_level?: string | null
          status?: string | null
          created_at?: string
        }
      }
      competitor: {
        Row: {
          competitor_id: number
          business_id: number | null
          competitor_name: string
          platform: string | null
          handle: string | null
          profile_url: string | null
        }
        Insert: {
          business_id?: number | null
          competitor_name: string
          platform?: string | null
          handle?: string | null
          profile_url?: string | null
        }
        Update: {
          business_id?: number | null
          competitor_name?: string
          platform?: string | null
          handle?: string | null
          profile_url?: string | null
        }
      }
      competitor_post: {
        Row: {
          c_post_id: number
          competitor_id: number | null
          caption: string | null
          media_url: string | null
          posted_date: string | null
        }
        Insert: {
          competitor_id?: number | null
          caption?: string | null
          media_url?: string | null
          posted_date?: string | null
        }
        Update: {
          competitor_id?: number | null
          caption?: string | null
          media_url?: string | null
          posted_date?: string | null
        }
      }
      competitor_post_analytics: {
        Row: {
          c_analytics_id: number
          c_post_id: number | null
          likes: number | null
          comments: number | null
          shares: number | null
          views: number | null
          engagement_rate: number | null
        }
        Insert: {
          c_post_id?: number | null
          likes?: number | null
          comments?: number | null
          shares?: number | null
          views?: number | null
          engagement_rate?: number | null
        }
        Update: {
          c_post_id?: number | null
          likes?: number | null
          comments?: number | null
          shares?: number | null
          views?: number | null
          engagement_rate?: number | null
        }
      }
    }
  }
}
