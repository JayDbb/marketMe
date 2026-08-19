create table if not exists public.workflows (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  name text not null,
  description text,
  template_key text not null,
  trigger_kind text not null,
  action_kind text not null,
  config jsonb not null default '{}'::jsonb,
  status text not null default 'enabled',
  last_run_at timestamptz,
  last_run_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workflows_status_check check (status in ('enabled', 'disabled')),
  constraint workflows_run_status_check check (
    last_run_status is null or last_run_status in ('running', 'success', 'warning', 'failed')
  )
);

create index if not exists idx_workflows_user_id on public.workflows(user_id);
create index if not exists idx_workflows_status on public.workflows(status);
create index if not exists idx_workflows_template_key on public.workflows(template_key);

create table if not exists public.workflow_runs (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references public.workflows(id) on delete cascade,
  user_id text not null,
  trigger_source text not null default 'manual',
  status text not null,
  summary text not null default '',
  details jsonb,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  constraint workflow_runs_status_check check (status in ('running', 'success', 'warning', 'failed')),
  constraint workflow_runs_trigger_source_check check (trigger_source in ('manual', 'automation', 'event'))
);

create index if not exists idx_workflow_runs_workflow_id on public.workflow_runs(workflow_id);
create index if not exists idx_workflow_runs_user_id on public.workflow_runs(user_id);
create index if not exists idx_workflow_runs_started_at on public.workflow_runs(started_at desc);

create or replace function public.handle_workflows_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_workflows_updated_at on public.workflows;
create trigger set_workflows_updated_at
  before update on public.workflows
  for each row
  execute function public.handle_workflows_updated_at();
