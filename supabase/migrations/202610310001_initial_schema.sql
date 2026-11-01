-- CampusMind relational foundation. Apply once to a new Supabase project.
create extension if not exists pgcrypto;

create type public.app_role as enum ('student', 'teacher', 'moderator', 'admin');
create type public.material_status as enum ('pending', 'published', 'rejected', 'removed');
create type public.report_status as enum ('open', 'reviewing', 'resolved', 'dismissed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  university_id uuid,
  program_id uuid,
  role public.app_role not null default 'student',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.universities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);
create table public.departments (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (university_id, name)
);
create table public.programs (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (department_id, name)
);
create table public.semesters (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  number smallint not null check (number > 0),
  label text not null,
  unique (program_id, number)
);
create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  semester_id uuid not null references public.semesters(id) on delete cascade,
  name text not null,
  code text not null,
  description text not null default '',
  created_at timestamptz not null default now(),
  unique (semester_id, code)
);
create table public.modules (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  title text not null,
  position integer not null default 0,
  unique (subject_id, position)
);
create table public.topics (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  position integer not null default 0,
  unique (module_id, position)
);
create table public.topic_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  is_completed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, topic_id)
);
create index topic_progress_topic_idx on public.topic_progress(topic_id, is_completed);

alter table public.profiles add constraint profiles_university_fk foreign key (university_id) references public.universities(id) on delete set null;
alter table public.profiles add constraint profiles_program_fk foreign key (program_id) references public.programs(id) on delete set null;

create table public.materials (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  topic_id uuid references public.topics(id) on delete set null,
  title text not null check (length(trim(title)) between 1 and 180),
  description text not null default '',
  resource_type text not null default 'notes',
  storage_path text,
  mime_type text,
  byte_size bigint check (byte_size is null or byte_size >= 0),
  status public.material_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index materials_topic_status_idx on public.materials(topic_id, status, created_at desc);
create index materials_subject_status_idx on public.materials(subject_id, status, created_at desc);
create index materials_owner_idx on public.materials(owner_id, created_at desc);

create table public.bookmarks (
  user_id uuid not null references public.profiles(id) on delete cascade,
  material_id uuid not null references public.materials(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, material_id)
);
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  title text not null default 'Untitled note',
  content text not null default '',
  tags text[] not null default '{}',
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index notes_owner_updated_idx on public.notes(owner_id, updated_at desc);
create table public.note_versions (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  content text not null,
  saved_at timestamptz not null default now()
);
create index note_versions_note_saved_idx on public.note_versions(note_id, saved_at desc);
create or replace function public.keep_note_version()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
  if old.title is distinct from new.title or old.content is distinct from new.content then
    insert into public.note_versions (note_id, owner_id, title, content)
    values (old.id, old.owner_id, old.title, old.content);
  end if;
  return new;
end $$;
create trigger notes_version_before_update before update on public.notes for each row execute function public.keep_note_version();

create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  title text not null,
  duration_minutes integer not null default 10 check (duration_minutes between 1 and 180),
  difficulty text not null default 'Medium' check (difficulty in ('Easy','Medium','Hard')),
  is_published boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  prompt text not null,
  options jsonb not null check (jsonb_typeof(options) = 'array'),
  position integer not null default 0,
  unique (quiz_id, position)
);
-- Keep answer keys out of client-readable question rows; score attempts in a trusted function.
create table public.quiz_answer_keys (
  question_id uuid primary key references public.quiz_questions(id) on delete cascade,
  answer_index integer not null check (answer_index >= 0),
  explanation text not null default ''
);
create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  score numeric(5,2) not null check (score between 0 and 100),
  answers jsonb not null default '[]'::jsonb,
  completed_at timestamptz not null default now()
);
create index quiz_attempts_user_idx on public.quiz_attempts(user_id, completed_at desc);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  material_id uuid not null references public.materials(id) on delete cascade,
  reason text not null,
  details text not null default '',
  status public.report_status not null default 'open',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index reports_status_created_idx on public.reports(status, created_at);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.current_app_role()
returns public.app_role language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() $$;

create or replace function public.set_updated_at()
returns trigger language plpgsql
as $$ begin new.updated_at = now(); return new; end $$;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger materials_updated_at before update on public.materials for each row execute function public.set_updated_at();
create trigger notes_updated_at before update on public.notes for each row execute function public.set_updated_at();
create trigger topic_progress_updated_at before update on public.topic_progress for each row execute function public.set_updated_at();

create or replace function public.create_profile_for_auth_user()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.create_profile_for_auth_user();

alter table public.profiles enable row level security;
alter table public.universities enable row level security;
alter table public.departments enable row level security;
alter table public.programs enable row level security;
alter table public.semesters enable row level security;
alter table public.subjects enable row level security;
alter table public.modules enable row level security;
alter table public.topics enable row level security;
alter table public.topic_progress enable row level security;
alter table public.materials enable row level security;
alter table public.bookmarks enable row level security;
alter table public.notes enable row level security;
alter table public.note_versions enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_answer_keys enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.reports enable row level security;
alter table public.audit_logs enable row level security;

create policy "Users can read their own profile" on public.profiles for select to authenticated using (id = auth.uid());
create policy "Users can update their own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid() and role = public.current_app_role());
create policy "Authenticated users can read academic structure" on public.universities for select to authenticated using (true);
create policy "Authenticated users can read departments" on public.departments for select to authenticated using (true);
create policy "Authenticated users can read programs" on public.programs for select to authenticated using (true);
create policy "Authenticated users can read semesters" on public.semesters for select to authenticated using (true);
create policy "Authenticated users can read subjects" on public.subjects for select to authenticated using (true);
create policy "Authenticated users can read modules" on public.modules for select to authenticated using (true);
create policy "Authenticated users can read topics" on public.topics for select to authenticated using (true);
create policy "Users manage their own topic progress" on public.topic_progress for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Users can read published materials or their own" on public.materials for select to authenticated using (status = 'published' or owner_id = auth.uid() or public.current_app_role() in ('moderator','admin'));
create policy "Users can submit their own materials" on public.materials for insert to authenticated with check (owner_id = auth.uid() and status = 'pending');
create policy "Owners can edit pending materials" on public.materials for update to authenticated using (owner_id = auth.uid() and status = 'pending') with check (owner_id = auth.uid() and status = 'pending');
create policy "Users can delete their own materials" on public.materials for delete to authenticated using (owner_id = auth.uid());

create policy "Users manage own bookmarks" on public.bookmarks for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users read own notes" on public.notes for select to authenticated using (owner_id = auth.uid() or (is_public and public.current_app_role() in ('teacher','moderator','admin')));
create policy "Users create own notes" on public.notes for insert to authenticated with check (owner_id = auth.uid());
create policy "Users update own notes" on public.notes for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Users delete own notes" on public.notes for delete to authenticated using (owner_id = auth.uid());
create policy "Users read own note versions" on public.note_versions for select to authenticated using (owner_id = auth.uid());

create policy "Users read published quizzes" on public.quizzes for select to authenticated using (is_published or created_by = auth.uid() or public.current_app_role() in ('teacher','moderator','admin'));
create policy "Users read questions for available quizzes" on public.quiz_questions for select to authenticated using (exists (select 1 from public.quizzes q where q.id = quiz_id and (q.is_published or q.created_by = auth.uid() or public.current_app_role() in ('teacher','moderator','admin'))));
create policy "Users read own quiz attempts" on public.quiz_attempts for select to authenticated using (user_id = auth.uid());

create policy "Users submit reports" on public.reports for insert to authenticated with check (reporter_id = auth.uid());
create policy "Users read own reports and moderators review all" on public.reports for select to authenticated using (reporter_id = auth.uid() or public.current_app_role() in ('moderator','admin'));
create policy "Moderators update reports" on public.reports for update to authenticated using (public.current_app_role() in ('moderator','admin')) with check (public.current_app_role() in ('moderator','admin'));
create policy "Only admins read audit logs" on public.audit_logs for select to authenticated using (public.current_app_role() = 'admin');

create or replace function public.submit_quiz_attempt(p_quiz_id uuid, p_answers jsonb)
returns numeric language plpgsql security definer set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_total integer;
  v_correct integer;
  v_score numeric(5,2);
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if jsonb_typeof(p_answers) <> 'object' then raise exception 'Answers must be an object'; end if;
  if not exists (select 1 from public.quizzes where id = p_quiz_id and is_published) then raise exception 'Quiz is not available'; end if;
  select count(*), count(*) filter (where (p_answers ->> q.id::text)::integer = answer.answer_index)
    into v_total, v_correct
    from public.quiz_questions q
    join public.quiz_answer_keys answer on answer.question_id = q.id
    where q.quiz_id = p_quiz_id;
  if v_total = 0 then raise exception 'Quiz has no scored questions'; end if;
  v_score := round((v_correct::numeric / v_total) * 100, 2);
  insert into public.quiz_attempts (user_id, quiz_id, score, answers)
  values (v_user, p_quiz_id, v_score, p_answers);
  return v_score;
end $$;
revoke all on function public.submit_quiz_attempt(uuid, jsonb) from public;
grant execute on function public.submit_quiz_attempt(uuid, jsonb) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('study-materials', 'study-materials', false, 26214400, array['application/pdf','image/png','image/jpeg','text/plain','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do nothing;
create policy "Students upload into their own folder" on storage.objects for insert to authenticated with check (bucket_id = 'study-materials' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Students read their own study files" on storage.objects for select to authenticated using (bucket_id = 'study-materials' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Authenticated users read published study files" on storage.objects for select to authenticated using (bucket_id = 'study-materials' and exists (select 1 from public.materials m where m.storage_path = name and m.status = 'published'));
create policy "Students delete their own study files" on storage.objects for delete to authenticated using (bucket_id = 'study-materials' and (storage.foldername(name))[1] = auth.uid()::text);

revoke all on public.audit_logs from anon, authenticated;
grant select on public.audit_logs to authenticated;

-- Academic structure writes and audit log inserts should be performed by trusted admin tooling.
