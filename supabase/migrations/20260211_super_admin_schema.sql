-- Super Admin Schema Update
-- Created: 2026-02-11

-- 1. Background Jobs (for Jobs & Background Workers)
create table if not exists public.background_jobs (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  status text not null check (status in ('pending', 'processing', 'completed', 'failed', 'retrying')),
  queue text default 'default',
  payload jsonb,
  result jsonb,
  error_message text,
  attempt_count int default 0,
  max_attempts int default 3,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone
);

-- 2. Feature Flags (for Feature Flags module)
create table if not exists public.feature_flags (
  id uuid default gen_random_uuid() primary key,
  key text not null unique,
  description text,
  is_enabled boolean default false,
  rules jsonb, -- For targeting specific users/schools
  rollout_percentage int default 0 check (rollout_percentage >= 0 and rollout_percentage <= 100),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_by uuid references auth.users(id)
);

-- 3. Integrations Config (for Integrations module)
create table if not exists public.integrations_config (
  id uuid default gen_random_uuid() primary key,
  provider text not null, -- e.g., 'stripe', 'sendgrid', 'aws'
  name text not null,
  is_enabled boolean default false,
  config jsonb, -- Encrypted keys should be stored cautiously, but here we store config
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. System Backups (for Backups & Exports)
create table if not exists public.system_backups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  size_bytes bigint,
  status text not null check (status in ('pending', 'creating', 'completed', 'failed')),
  url text, -- Signed URL to download
  type text default 'manual', -- 'manual', 'scheduled'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone
);

-- 5. Support Tickets (for Support & Incidents)
create table if not exists public.support_tickets (
  id uuid default gen_random_uuid() primary key,
  subject text not null,
  description text,
  status text default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  user_id uuid references auth.users(id), -- Reporter
  school_id uuid references public.schools(id),
  assigned_to uuid references auth.users(id), -- Admin agent
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Security Policies (for Security module)
create table if not exists public.security_policies (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  type text not null check (type in ('mfa', 'ip_allowlist', 'password_policy', 'session')),
  policy_config jsonb not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies (Super Admins Only)
-- We assume a 'is_super_admin' check exists in profiles or logic

alter table public.background_jobs enable row level security;
alter table public.feature_flags enable row level security;
alter table public.integrations_config enable row level security;
alter table public.system_backups enable row level security;
alter table public.support_tickets enable row level security;
alter table public.security_policies enable row level security;

-- Create generic super admin policy for all new tables
-- Note: usage dependent on how auth setup is done. Assuming simple check for now.
-- Ideally we use a helper function `is_super_admin()`

-- Policy: Only Super Admins can do anything
create policy "Super Admins Full Access - Background Jobs" on public.background_jobs
for all using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and is_super_admin = true
  )
);

create policy "Super Admins Full Access - Feature Flags" on public.feature_flags
for all using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and is_super_admin = true
  )
);

create policy "Super Admins Full Access - Integrations" on public.integrations_config
for all using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and is_super_admin = true
  )
);

create policy "Super Admins Full Access - Backups" on public.system_backups
for all using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and is_super_admin = true
  )
);

create policy "Super Admins Full Access - Security Policies" on public.security_policies
for all using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and is_super_admin = true
  )
);

-- Support Tickets might need User access to create/read their own
create policy "Users can view own tickets" on public.support_tickets
for select using (
  auth.uid() = user_id
);

create policy "Users can create tickets" on public.support_tickets
for insert with check (
  auth.uid() = user_id
);

create policy "Super Admins Full Access - Tickets" on public.support_tickets
for all using (
    exists (
    select 1 from public.profiles
    where id = auth.uid() and is_super_admin = true
  )
);

-- Realtime enablement
alter publication supabase_realtime add table public.background_jobs;
alter publication supabase_realtime add table public.support_tickets;
alter publication supabase_realtime add table public.feature_flags;
