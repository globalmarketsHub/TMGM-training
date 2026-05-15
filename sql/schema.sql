-- PostgreSQL / Supabase schema for TMGM Chelsea Training CRM.
-- Prisma is the primary migration source; this file is provided for review or manual setup.

create extension if not exists "pgcrypto";

create type "Role" as enum ('ADMIN', 'EMPLOYEE');
create type "UserStatus" as enum ('ACTIVE', 'DISABLED', 'DELETED');
create type "TrainingStatus" as enum ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');
create type "QuestionType" as enum ('MCQ', 'TRUE_FALSE', 'SHORT_TEXT');
create type "TimeLogSource" as enum ('TIMER', 'VIDEO', 'MANUAL');

create table users (
  id uuid primary key default gen_random_uuid(),
  email varchar(255) not null unique,
  password_hash text not null,
  role "Role" not null,
  status "UserStatus" not null default 'ACTIVE',
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table employees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  employee_code varchar(50) not null unique,
  full_name varchar(120) not null,
  department varchar(120),
  position varchar(120),
  manager varchar(120),
  hired_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table training_days (
  id uuid primary key default gen_random_uuid(),
  day_number integer unique,
  title varchar(180) not null,
  summary text not null,
  content_json jsonb not null,
  video_url text,
  pdf_url text,
  link_url text,
  is_final_exam boolean not null default false,
  is_published boolean not null default true,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table training_progress (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  training_day_id uuid not null references training_days(id) on delete cascade,
  status "TrainingStatus" not null default 'NOT_STARTED',
  active_seconds integer not null default 0,
  last_opened_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (employee_id, training_day_id)
);

create table active_time_logs (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  training_day_id uuid not null references training_days(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  duration_seconds integer not null,
  source "TimeLogSource" not null default 'TIMER',
  client_meta jsonb,
  created_at timestamptz not null default now()
);

create table exam_questions (
  id uuid primary key default gen_random_uuid(),
  type "QuestionType" not null,
  prompt text not null,
  options jsonb,
  correct_answer text,
  score integer not null default 10,
  sort_order integer not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table exam_results (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  score integer not null,
  total_score integer not null,
  passed boolean not null,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table exam_answers (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  question_id uuid not null references exam_questions(id) on delete restrict,
  exam_result_id uuid not null references exam_results(id) on delete cascade,
  answer_text text not null,
  is_correct boolean,
  score_awarded integer not null default 0,
  created_at timestamptz not null default now()
);

create index employees_department_idx on employees(department);
create index training_days_sort_order_idx on training_days(sort_order);
create index training_progress_training_day_id_idx on training_progress(training_day_id);
create index active_time_logs_employee_day_idx on active_time_logs(employee_id, training_day_id);
create index active_time_logs_started_at_idx on active_time_logs(started_at);
create index exam_results_employee_submitted_idx on exam_results(employee_id, submitted_at);
create index exam_answers_employee_idx on exam_answers(employee_id);
create index exam_answers_result_idx on exam_answers(exam_result_id);
