-- ============================================================
-- MAR-12: Create business_profiles table
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================

-- 1. Create the table
create table if not exists public.business_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_name text,
  industry text,
  location text,
  website text,
  services text,
  usp text,
  primary_goal text,
  social_handle text,
  tone text,
  target_customers text,
  competitors text,
  channels text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Each user can only have one business profile
  constraint business_profiles_user_id_unique unique (user_id)
);

-- 2. Enable Row Level Security
alter table public.business_profiles enable row level security;

-- 3. RLS Policies: users can only access their own profile

-- SELECT: users can read their own profile
create policy "Users can read own profile"
  on public.business_profiles
  for select
  using (auth.uid() = user_id);

-- INSERT: users can create their own profile
create policy "Users can create own profile"
  on public.business_profiles
  for insert
  with check (auth.uid() = user_id);

-- UPDATE: users can update their own profile
create policy "Users can update own profile"
  on public.business_profiles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- DELETE: users can delete their own profile
create policy "Users can delete own profile"
  on public.business_profiles
  for delete
  using (auth.uid() = user_id);

-- 4. Auto-update `updated_at` on row changes
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.business_profiles
  for each row
  execute function public.handle_updated_at();

-- 5. Index for fast lookups by user_id
create index if not exists idx_business_profiles_user_id
  on public.business_profiles(user_id);
