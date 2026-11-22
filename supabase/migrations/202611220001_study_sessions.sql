-- Store completed focus sessions so weekly study summaries use real activity.
create table public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  duration_seconds integer not null check (duration_seconds between 1 and 86400),
  started_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index study_sessions_user_started_idx
  on public.study_sessions(user_id, started_at desc);

alter table public.study_sessions enable row level security;

create policy "Users read their own study sessions"
  on public.study_sessions for select to authenticated
  using (user_id = auth.uid());

create policy "Users create their own study sessions"
  on public.study_sessions for insert to authenticated
  with check (user_id = auth.uid());

grant select, insert on public.study_sessions to authenticated;
