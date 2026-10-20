-- MyLife Planner — Initial Database Schema
-- Apply this migration to a fresh Supabase project.
-- Every user-owned table has Row Level Security (RLS) enabled with policies
-- ensuring users can only access their own records.

-- ---------------------------------------------------------------------------
-- 1. Profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  email text,
  time_zone text default 'Asia/Kolkata',
  currency text default 'INR',
  date_format text default 'DD/MM/YYYY',
  week_starts_on int default 1, -- 0=Sunday, 1=Monday
  onboarding_completed boolean default false,
  working_hours_start time default '09:00',
  working_hours_end time default '18:00',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

create policy "Users can delete own profile"
  on public.profiles for delete
  using ( auth.uid() = id );

-- ---------------------------------------------------------------------------
-- 2. User Preferences
-- ---------------------------------------------------------------------------
create table public.user_preferences (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null unique,
  theme text default 'system', -- light | dark | system
  notifications_enabled boolean default true,
  default_task_priority text default 'medium',
  dashboard_widgets jsonb default '[]',
  week_starts_on int default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.user_preferences enable row level security;

create policy "Users can view own preferences"
  on public.user_preferences for select
  using ( auth.uid() = user_id );

create policy "Users can insert own preferences"
  on public.user_preferences for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own preferences"
  on public.user_preferences for update
  using ( auth.uid() = user_id );

create policy "Users can delete own preferences"
  on public.user_preferences for delete
  using ( auth.uid() = user_id );

-- ---------------------------------------------------------------------------
-- 3. Tasks
-- ---------------------------------------------------------------------------
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  status text default 'not_started', -- not_started | in_progress | completed
  priority text default 'medium', -- low | medium | high | urgent
  category text,
  project_id uuid,
  due_date date,
  due_time time,
  start_date date,
  estimated_duration int, -- minutes
  actual_duration int, -- minutes
  recurrence_rule text, -- daily | weekdays | weekly | monthly | custom | null
  reminder_settings jsonb default '[]',
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.tasks enable row level security;

create index idx_tasks_user_id on public.tasks(user_id);
create index idx_tasks_due_date on public.tasks(due_date);
create index idx_tasks_status on public.tasks(status);
create index idx_tasks_category on public.tasks(category);
create index idx_tasks_project_id on public.tasks(project_id);

create policy "Users can manage own tasks"
  on public.tasks for all
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

-- ---------------------------------------------------------------------------
-- 4. Task Subtasks
-- ---------------------------------------------------------------------------
create table public.task_subtasks (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  title text not null,
  is_completed boolean default false,
  sort_order int default 0,
  created_at timestamptz default now()
);

alter table public.task_subtasks enable row level security;

create policy "Users can manage subtasks of own tasks"
  on public.task_subtasks for all
  using (
    exists (select 1 from public.tasks where id = task_id and user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.tasks where id = task_id and user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- 5. Task Tags
-- ---------------------------------------------------------------------------
create table public.task_tags (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  color text default '#64748b',
  created_at timestamptz default now()
);

alter table public.task_tags enable row level security;

create policy "Users can manage own task tags"
  on public.task_tags for all
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

create table public.task_tag_assignments (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  tag_id uuid references public.task_tags(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(task_id, tag_id)
);

alter table public.task_tag_assignments enable row level security;

create policy "Users can manage tag assignments of own tasks"
  on public.task_tag_assignments for all
  using (
    exists (select 1 from public.tasks where id = task_id and user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.tasks where id = task_id and user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- 6. Habits
-- ---------------------------------------------------------------------------
create table public.habits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  icon text default '🎯',
  category text,
  start_date date default current_date,
  frequency text default 'daily', -- daily | weekdays | weekly | custom
  target_quantity int default 1,
  target_unit text default 'times',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.habits enable row level security;

create index idx_habits_user_id on public.habits(user_id);
create index idx_habits_active on public.habits(is_active);

create policy "Users can manage own habits"
  on public.habits for all
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

-- ---------------------------------------------------------------------------
-- 7. Habit Completions
-- ---------------------------------------------------------------------------
create table public.habit_completions (
  id uuid default gen_random_uuid() primary key,
  habit_id uuid references public.habits(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  completed_at date not null,
  quantity int default 1,
  created_at timestamptz default now(),
  unique(habit_id, completed_at)
);

alter table public.habit_completions enable row level security;

create index idx_habit_completions_habit_id on public.habit_completions(habit_id);
create index idx_habit_completions_user_id on public.habit_completions(user_id);
create index idx_habit_completions_date on public.habit_completions(completed_at);

create policy "Users can manage own habit completions"
  on public.habit_completions for all
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

-- ---------------------------------------------------------------------------
-- 8. Courses
-- ---------------------------------------------------------------------------
create table public.courses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  code text,
  name text not null,
  instructor text,
  semester text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.courses enable row level security;

create policy "Users can manage own courses"
  on public.courses for all
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

-- ---------------------------------------------------------------------------
-- 9. Assignments
-- ---------------------------------------------------------------------------
create table public.assignments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  course_id uuid references public.courses(id) on delete set null,
  title text not null,
  description text,
  due_date date,
  status text default 'pending', -- pending | submitted | graded
  grade text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.assignments enable row level security;

create index idx_assignments_user_id on public.assignments(user_id);
create index idx_assignments_course_id on public.assignments(course_id);
create index idx_assignments_due_date on public.assignments(due_date);

create policy "Users can manage own assignments"
  on public.assignments for all
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

-- ---------------------------------------------------------------------------
-- 10. Study Sessions
-- ---------------------------------------------------------------------------
create table public.study_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  course_id uuid references public.courses(id) on delete set null,
  title text not null,
  scheduled_at timestamptz,
  duration_minutes int,
  actual_duration_minutes int,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.study_sessions enable row level security;

create policy "Users can manage own study sessions"
  on public.study_sessions for all
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

-- ---------------------------------------------------------------------------
-- 11. Events (Calendar)
-- ---------------------------------------------------------------------------
create table public.events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  category text,
  color text default '#3b82f6',
  is_all_day boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.events enable row level security;

create index idx_events_user_id on public.events(user_id);
create index idx_events_start_at on public.events(start_at);
create index idx_events_category on public.events(category);

create policy "Users can manage own events"
  on public.events for all
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

-- ---------------------------------------------------------------------------
-- 12. Goals
-- ---------------------------------------------------------------------------
create table public.goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  category text, -- academic | career | financial | health | personal | custom
  start_date date default current_date,
  target_date date,
  progress int default 0, -- 0-100
  status text default 'active', -- active | paused | completed | archived
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.goals enable row level security;

create index idx_goals_user_id on public.goals(user_id);
create index idx_goals_category on public.goals(category);
create index idx_goals_status on public.goals(status);

create policy "Users can manage own goals"
  on public.goals for all
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

-- ---------------------------------------------------------------------------
-- 13. Goal Milestones
-- ---------------------------------------------------------------------------
create table public.goal_milestones (
  id uuid default gen_random_uuid() primary key,
  goal_id uuid references public.goals(id) on delete cascade not null,
  title text not null,
  due_date date,
  is_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.goal_milestones enable row level security;

create policy "Users can manage milestones of own goals"
  on public.goal_milestones for all
  using (
    exists (select 1 from public.goals where id = goal_id and user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.goals where id = goal_id and user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- 14. Projects
-- ---------------------------------------------------------------------------
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  status text default 'active', -- active | paused | completed | archived
  deadline date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.projects enable row level security;

create index idx_projects_user_id on public.projects(user_id);
create index idx_projects_status on public.projects(status);

create policy "Users can manage own projects"
  on public.projects for all
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

-- ---------------------------------------------------------------------------
-- 15. Project Milestones
-- ---------------------------------------------------------------------------
create table public.project_milestones (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  due_date date,
  is_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.project_milestones enable row level security;

create policy "Users can manage milestones of own projects"
  on public.project_milestones for all
  using (
    exists (select 1 from public.projects where id = project_id and user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.projects where id = project_id and user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- 16. Transactions (Finance)
-- ---------------------------------------------------------------------------
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  type text not null, -- income | expense
  amount_cents bigint not null default 0, -- stored in cents to avoid float issues
  currency text default 'INR',
  transaction_date date default current_date,
  category text,
  payment_method text,
  account text,
  description text,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.transactions enable row level security;

create index idx_transactions_user_id on public.transactions(user_id);
create index idx_transactions_date on public.transactions(transaction_date);
create index idx_transactions_type on public.transactions(type);
create index idx_transactions_category on public.transactions(category);

create policy "Users can manage own transactions"
  on public.transactions for all
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

-- ---------------------------------------------------------------------------
-- 17. Budget Categories
-- ---------------------------------------------------------------------------
create table public.budget_categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  monthly_limit bigint default 0, -- cents
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.budget_categories enable row level security;

create policy "Users can manage own budget categories"
  on public.budget_categories for all
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

-- ---------------------------------------------------------------------------
-- 18. Budgets
-- ---------------------------------------------------------------------------
create table public.budgets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  category_id uuid references public.budget_categories(id) on delete cascade,
  month text not null, -- YYYY-MM
  limit_amount bigint default 0, -- cents
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(category_id, month)
);

alter table public.budgets enable row level security;

create policy "Users can manage own budgets"
  on public.budgets for all
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

-- ---------------------------------------------------------------------------
-- 19. Savings Goals
-- ---------------------------------------------------------------------------
create table public.savings_goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  target_amount bigint not null default 0, -- cents
  current_amount bigint not null default 0, -- cents
  target_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.savings_goals enable row level security;

create policy "Users can manage own savings goals"
  on public.savings_goals for all
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

-- ---------------------------------------------------------------------------
-- 20. Notes
-- ---------------------------------------------------------------------------
create table public.notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text,
  content text,
  is_pinned boolean default false,
  is_archived boolean default false,
  tags text[] default '{}',
  linked_task_id uuid,
  linked_course_id uuid,
  linked_project_id uuid,
  linked_goal_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.notes enable row level security;

create index idx_notes_user_id on public.notes(user_id);
create index idx_notes_is_pinned on public.notes(is_pinned);
create index idx_notes_is_archived on public.notes(is_archived);

create policy "Users can manage own notes"
  on public.notes for all
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

-- ---------------------------------------------------------------------------
-- 21. Notifications
-- ---------------------------------------------------------------------------
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  body text,
  type text default 'info', -- info | success | warning | error | reminder
  is_read boolean default false,
  scheduled_for timestamptz,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

create index idx_notifications_user_id on public.notifications(user_id);
create index idx_notifications_is_read on public.notifications(is_read);

create policy "Users can manage own notifications"
  on public.notifications for all
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

-- ---------------------------------------------------------------------------
-- 22. Daily Plans
-- ---------------------------------------------------------------------------
create table public.daily_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  plan_date date not null,
  intentions text,
  priorities jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, plan_date)
);

alter table public.daily_plans enable row level security;

create index idx_daily_plans_user_id on public.daily_plans(user_id);
create index idx_daily_plans_date on public.daily_plans(plan_date);

create policy "Users can manage own daily plans"
  on public.daily_plans for all
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

-- ---------------------------------------------------------------------------
-- 23. Daily Reviews
-- ---------------------------------------------------------------------------
create table public.daily_reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  review_date date not null,
  achievements text,
  reflections text,
  rating int check (rating >= 1 and rating <= 5),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, review_date)
);

alter table public.daily_reviews enable row level security;

create index idx_daily_reviews_user_id on public.daily_reviews(user_id);
create index idx_daily_reviews_date on public.daily_reviews(review_date);

create policy "Users can manage own daily reviews"
  on public.daily_reviews for all
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

-- ---------------------------------------------------------------------------
-- 24. Updated-at Triggers
-- ---------------------------------------------------------------------------
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at trigger to tables that have updated_at
do $$
declare tbl record;
begin
  for tbl in
    select tablename from pg_tables where schemaname = 'public'
      and tablename in (
        'profiles','user_preferences','tasks','habits','courses','assignments',
        'study_sessions','events','goals','goal_milestones','projects',
        'project_milestones','transactions','budget_categories','budgets',
        'savings_goals','notes','daily_plans','daily_reviews'
      )
  loop
    execute format(
      'create trigger update_%I_updated_at before update on public.%I for each row execute function public.update_updated_at_column()',
      tbl.tablename, tbl.tablename
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 25. Helpful Views (read-only convenience)
-- ---------------------------------------------------------------------------
create view public.task_stats as
select
  user_id,
  count(*) filter (where status = 'completed') as completed_count,
  count(*) filter (where status != 'completed') as pending_count,
  count(*) filter (where due_date < current_date and status != 'completed') as overdue_count
from public.tasks
group by user_id;

alter table public.task_stats owner to postgres;
-- RLS on views: use underlying table policies via supabase (views inherit table RLS in Postgres 15+)
-- If needed, grant select to authenticated:
-- grant select on public.task_stats to authenticated;

comment on table public.profiles is 'User profile and onboarding state.';
comment on table public.tasks is 'Core task management records.';
comment on table public.habit_completions is 'One record per habit per date (unique constraint prevents duplicates).';
comment on table public.transactions is 'Financial transactions stored in cents (fixed precision).';
comment on table public.notifications is 'In-app notification center records.';
