-- Initial Schema based on the visual ER diagram

-- Profiles
CREATE TABLE public.profiles (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name text,
    email text,
    role text,
    created_at timestamp with time zone DEFAULT now()
);

-- Business
CREATE TABLE public.business (
    business_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    business_name text NOT NULL,
    business_type text,
    location text,
    description text,
    created_at timestamp with time zone DEFAULT now()
);

-- Business User (Junction)
CREATE TABLE public.business_user (
    b_user_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    business_id bigint REFERENCES public.business(business_id) ON DELETE CASCADE,
    access_level text
);

-- Social Account
CREATE TABLE public.social_account (
    account_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    business_id bigint REFERENCES public.business(business_id) ON DELETE CASCADE,
    platform text NOT NULL,
    handle text,
    account_url text,
    connected_status boolean DEFAULT false
);

-- Marketing Strategy
CREATE TABLE public.marketing_strategy (
    strategy_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    business_id bigint REFERENCES public.business(business_id) ON DELETE CASCADE,
    strategy_name text NOT NULL,
    strategy_type text,
    description text,
    goal text,
    status text,
    created_at timestamp with time zone DEFAULT now()
);

-- Content Schedule
CREATE TABLE public.content_schedule (
    schedule_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    business_id bigint REFERENCES public.business(business_id) ON DELETE CASCADE,
    strategy_id bigint REFERENCES public.marketing_strategy(strategy_id) ON DELETE SET NULL,
    week_start_date date,
    week_end_date date,
    schedule_status text,
    created_at timestamp with time zone DEFAULT now()
);

-- Content Idea
CREATE TABLE public.content_idea (
    idea_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    business_id bigint REFERENCES public.business(business_id) ON DELETE CASCADE,
    title text,
    description text,
    content_type text,
    status text,
    generated_at timestamp with time zone DEFAULT now()
);

-- Post
CREATE TABLE public.post (
    post_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    business_id bigint REFERENCES public.business(business_id) ON DELETE CASCADE,
    account_id bigint REFERENCES public.social_account(account_id) ON DELETE SET NULL,
    idea_id bigint REFERENCES public.content_idea(idea_id) ON DELETE SET NULL,
    schedule_id bigint REFERENCES public.content_schedule(schedule_id) ON DELETE SET NULL,
    caption text,
    media_url text,
    scheduled_date timestamp with time zone,
    status text
);

-- Generated Asset
CREATE TABLE public.generated_asset (
    asset_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    post_id bigint REFERENCES public.post(post_id) ON DELETE CASCADE,
    asset_type text,
    file_url text,
    created_at timestamp with time zone DEFAULT now()
);

-- Post Analytics
CREATE TABLE public.post_analytics (
    analytics_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    post_id bigint REFERENCES public.post(post_id) ON DELETE CASCADE,
    likes integer DEFAULT 0,
    comments integer DEFAULT 0,
    shares integer DEFAULT 0,
    views integer DEFAULT 0,
    reach integer DEFAULT 0,
    engagement_rate numeric DEFAULT 0
);

-- Customer Engagement
CREATE TABLE public.customer_engagement (
    engagement_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    business_id bigint REFERENCES public.business(business_id) ON DELETE CASCADE,
    post_id bigint REFERENCES public.post(post_id) ON DELETE CASCADE,
    customer_name text,
    engagement_type text,
    response_status text,
    created_at timestamp with time zone DEFAULT now()
);

-- Customer Inquiry
CREATE TABLE public.customer_inquiry (
    inquiry_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    business_id bigint REFERENCES public.business(business_id) ON DELETE CASCADE,
    post_id bigint REFERENCES public.post(post_id) ON DELETE CASCADE,
    customer_name text,
    message text,
    inquiry_type text,
    suggested_response text,
    response_status text,
    created_at timestamp with time zone DEFAULT now(),
    responded_at timestamp with time zone
);

-- Analytics Report
CREATE TABLE public.analytics_report (
    report_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    account_id bigint REFERENCES public.social_account(account_id) ON DELETE CASCADE,
    report_period text,
    total_posts integer DEFAULT 0,
    total_engagements bigint DEFAULT 0,
    average_engagement_rate numeric DEFAULT 0,
    generated_at timestamp with time zone DEFAULT now()
);

-- Recommendation
CREATE TABLE public.recommendation (
    recommendation_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    report_id bigint REFERENCES public.analytics_report(report_id) ON DELETE CASCADE,
    recommendation_type text,
    description text,
    priority_level text,
    status text,
    created_at timestamp with time zone DEFAULT now()
);

-- Competitor
CREATE TABLE public.competitor (
    competitor_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    business_id bigint REFERENCES public.business(business_id) ON DELETE CASCADE,
    competitor_name text NOT NULL,
    platform text,
    handle text,
    profile_url text
);

-- Competitor Post
CREATE TABLE public.competitor_post (
    c_post_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    competitor_id bigint REFERENCES public.competitor(competitor_id) ON DELETE CASCADE,
    caption text,
    media_url text,
    posted_date timestamp with time zone
);

-- Competitor Post Analytics
CREATE TABLE public.competitor_post_analytics (
    c_analytics_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    c_post_id bigint REFERENCES public.competitor_post(c_post_id) ON DELETE CASCADE,
    likes integer DEFAULT 0,
    comments integer DEFAULT 0,
    shares integer DEFAULT 0,
    views integer DEFAULT 0,
    engagement_rate numeric DEFAULT 0
);
