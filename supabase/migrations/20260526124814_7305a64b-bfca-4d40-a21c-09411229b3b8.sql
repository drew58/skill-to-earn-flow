
-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  country text,
  experience_level text,
  skills text[] default '{}',
  goals text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Plans
create table public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Income Plan',
  input jsonb not null default '{}'::jsonb,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.plans enable row level security;
create policy "plans_select_own" on public.plans for select using (auth.uid() = user_id);
create policy "plans_insert_own" on public.plans for insert with check (auth.uid() = user_id);
create policy "plans_update_own" on public.plans for update using (auth.uid() = user_id);
create policy "plans_delete_own" on public.plans for delete using (auth.uid() = user_id);

-- Missions
create table public.missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid references public.plans(id) on delete set null,
  title text not null,
  description text,
  due_date date not null default current_date,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.missions enable row level security;
create policy "missions_select_own" on public.missions for select using (auth.uid() = user_id);
create policy "missions_insert_own" on public.missions for insert with check (auth.uid() = user_id);
create policy "missions_update_own" on public.missions for update using (auth.uid() = user_id);
create policy "missions_delete_own" on public.missions for delete using (auth.uid() = user_id);

-- Streaks
create table public.streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  tasks_completed int not null default 0,
  last_active_date date,
  updated_at timestamptz not null default now()
);
alter table public.streaks enable row level security;
create policy "streaks_select_own" on public.streaks for select using (auth.uid() = user_id);
create policy "streaks_insert_own" on public.streaks for insert with check (auth.uid() = user_id);
create policy "streaks_update_own" on public.streaks for update using (auth.uid() = user_id);

-- Auto-create profile + streak on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  insert into public.streaks (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
