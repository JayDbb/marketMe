-- ============================================================
-- MAR-XX: Create AI Memory Vector Table
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================

-- 1. Enable the pgvector extension to work with embedding vectors
create extension if not exists vector
with
  schema extensions;

-- 2. Create the marketing_knowledge table
create table if not exists public.marketing_knowledge (
  id uuid primary key default gen_random_uuid(),
  business_profile_id uuid not null references public.business_profiles(id) on delete cascade,
  content text not null, -- The raw text content of the successful post/strategy
  metadata jsonb default '{}'::jsonb, -- Store info like platform, engagement metrics, etc.
  embedding vector(1536), -- 1536 is the default size for OpenAI's text-embedding-3-small
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Enable Row Level Security
alter table public.marketing_knowledge enable row level security;

-- 4. RLS Policies
-- SELECT: Users can only read vectors for their own business profile
create policy "Users can read own marketing knowledge"
  on public.marketing_knowledge
  for select
  using (
    business_profile_id in (
      select id from public.business_profiles where user_id = auth.uid()
    )
  );

-- INSERT: Trigger.dev background tasks using a Service Role key bypass RLS,
-- but for completeness, we allow users to insert into their own profiles.
create policy "Users can insert own marketing knowledge"
  on public.marketing_knowledge
  for insert
  with check (
    business_profile_id in (
      select id from public.business_profiles where user_id = auth.uid()
    )
  );

-- UPDATE/DELETE
create policy "Users can update own marketing knowledge"
  on public.marketing_knowledge
  for update
  using (
    business_profile_id in (
      select id from public.business_profiles where user_id = auth.uid()
    )
  )
  with check (
    business_profile_id in (
      select id from public.business_profiles where user_id = auth.uid()
    )
  );

create policy "Users can delete own marketing knowledge"
  on public.marketing_knowledge
  for delete
  using (
    business_profile_id in (
      select id from public.business_profiles where user_id = auth.uid()
    )
  );

-- 5. Create an HNSW index for fast similarity search
create index if not exists marketing_knowledge_embedding_idx 
  on public.marketing_knowledge 
  using hnsw (embedding vector_cosine_ops);

-- 6. RPC Function for Similarity Search
-- We create a Postgres function to search for matching marketing knowledge.
-- The AI can call this function via Supabase RPC to retrieve the context.
create or replace function match_marketing_knowledge (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_business_profile_id uuid
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    marketing_knowledge.id,
    marketing_knowledge.content,
    marketing_knowledge.metadata,
    1 - (marketing_knowledge.embedding <=> query_embedding) as similarity
  from marketing_knowledge
  where marketing_knowledge.business_profile_id = p_business_profile_id
    and 1 - (marketing_knowledge.embedding <=> query_embedding) > match_threshold
  order by marketing_knowledge.embedding <=> query_embedding
  limit match_count;
$$;
