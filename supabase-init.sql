create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'Role') then
    create type "Role" as enum ('ADMIN', 'EMPLOYEE');
  end if;
  if not exists (select 1 from pg_type where typname = 'UserStatus') then
    create type "UserStatus" as enum ('ACTIVE', 'DISABLED', 'DELETED');
  end if;
  if not exists (select 1 from pg_type where typname = 'TrainingStatus') then
    create type "TrainingStatus" as enum ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');
  end if;
  if not exists (select 1 from pg_type where typname = 'QuestionType') then
    create type "QuestionType" as enum ('MCQ', 'TRUE_FALSE', 'SHORT_TEXT');
  end if;
  if not exists (select 1 from pg_type where typname = 'TimeLogSource') then
    create type "TimeLogSource" as enum ('TIMER', 'VIDEO', 'MANUAL');
  end if;
end $$;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email varchar(255) not null unique,
  password_hash text not null,
  role "Role" not null,
  status "UserStatus" not null default 'ACTIVE',
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists employees (
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

create table if not exists training_days (
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

create table if not exists training_progress (
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

create table if not exists active_time_logs (
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

create table if not exists exam_questions (
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

create table if not exists exam_results (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  score integer not null,
  total_score integer not null,
  passed boolean not null,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists exam_answers (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  question_id uuid not null references exam_questions(id) on delete restrict,
  exam_result_id uuid not null references exam_results(id) on delete cascade,
  answer_text text not null,
  is_correct boolean,
  score_awarded integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists employees_department_idx on employees(department);
create index if not exists training_days_sort_order_idx on training_days(sort_order);
create index if not exists training_progress_training_day_id_idx on training_progress(training_day_id);
create index if not exists active_time_logs_employee_day_idx on active_time_logs(employee_id, training_day_id);
create index if not exists active_time_logs_started_at_idx on active_time_logs(started_at);
create index if not exists exam_results_employee_submitted_idx on exam_results(employee_id, submitted_at);
create index if not exists exam_answers_employee_idx on exam_answers(employee_id);
create index if not exists exam_answers_result_idx on exam_answers(exam_result_id);

insert into users (email, password_hash, role, status)
values ('admin@tmgm.local', crypt('Admin@123456', gen_salt('bf', 12)), 'ADMIN', 'ACTIVE')
on conflict (email) do update
set password_hash = excluded.password_hash,
    role = 'ADMIN',
    status = 'ACTIVE',
    updated_at = now();

insert into training_days (day_number, title, summary, content_json, is_final_exam, is_published, sort_order)
values
(1, '公司介绍与合规基础', '了解 TMGM 品牌、Chelsea 合作调性、员工行为规范、基础监管与合规边界。', '{"blocks":[{"type":"heading","text":"学习目标"},{"type":"paragraph","text":"掌握公司业务范围、品牌价值、员工合规红线和客户沟通中的基础免责声明。"},{"type":"checklist","items":["公司与品牌定位","金融服务合规常识","员工信息安全要求","客户风险提示表达"]},{"type":"paragraph","text":"这里是可编辑内容模板。后续可以替换为内部文档、图片、视频、PDF 或外部链接。"}]}'::jsonb, false, true, 1),
(2, 'TMGM 产品与账户类型', '熟悉账户类型、交易产品、点差与佣金基础表达。', '{"blocks":[{"type":"heading","text":"学习目标"},{"type":"paragraph","text":"理解不同账户类型的定位，并能向客户清楚解释产品类别和费用结构。"},{"type":"checklist","items":["账户类型","产品分类","交易成本","常见客户问题"]}]}'::jsonb, false, true, 2),
(3, 'MT4 / MT5 基础操作', '学习平台安装、登录、图表、订单、历史记录和常见问题排查。', '{"blocks":[{"type":"heading","text":"平台操作模板"},{"type":"paragraph","text":"可在此放置 MT4/MT5 操作截图、演示视频和下载链接。"},{"type":"checklist","items":["平台登录","图表与指标","市价单与挂单","交易历史导出"]}]}'::jsonb, false, true, 3),
(4, '入金、出金、KYC 流程', '掌握客户开户、身份认证、资金流转和异常流程处理。', '{"blocks":[{"type":"heading","text":"流程训练"},{"type":"paragraph","text":"本页面用于沉淀 KYC 审核标准、入出金材料说明、常见失败原因和升级路径。"},{"type":"checklist","items":["KYC 材料","入金路径","出金规则","异常工单"]}]}'::jsonb, false, true, 4),
(5, 'IB 代理合作与返佣逻辑', '了解代理层级、返佣计算、归属关系和合规沟通边界。', '{"blocks":[{"type":"heading","text":"IB 合作基础"},{"type":"paragraph","text":"后续可替换为真实返佣政策、内部审批规则和案例说明。"},{"type":"checklist","items":["代理类型","返佣口径","客户归属","禁止承诺事项"]}]}'::jsonb, false, true, 5),
(6, '客户沟通与销售话术', '训练企业化沟通方式、需求识别、异议处理和风险提示。', '{"blocks":[{"type":"heading","text":"沟通训练"},{"type":"paragraph","text":"本页面可放置话术库、录音示例、角色扮演材料和客户分层处理方式。"},{"type":"checklist","items":["开场与需求确认","产品说明","异议处理","合规收尾"]}]}'::jsonb, false, true, 6),
(7, '风控、滑点、点差、市场深度', '理解交易执行、流动性、市场波动和风控沟通。', '{"blocks":[{"type":"heading","text":"交易风控理解"},{"type":"paragraph","text":"可补充市场深度图、报价波动案例、滑点解释模板和风险事件复盘。"},{"type":"checklist","items":["点差","滑点","流动性","市场深度","异常行情沟通"]}]}'::jsonb, false, true, 7),
(8, 'CRM 系统操作与客户管理', '掌握客户资料维护、跟进记录、线索阶段、任务提醒和数据安全。', '{"blocks":[{"type":"heading","text":"CRM 操作训练"},{"type":"paragraph","text":"本页面用于承载 CRM 操作截图、客户生命周期说明和字段规范。"},{"type":"checklist","items":["客户建档","跟进记录","任务提醒","数据导出规范"]}]}'::jsonb, false, true, 8),
(99, 'Final Exam: 综合考试', '完成 8 天培训后进行综合考试。', '{"blocks":[{"type":"paragraph","text":"考试题目可在管理员后台维护。"}]}'::jsonb, true, true, 99)
on conflict (day_number) do update
set title = excluded.title,
    summary = excluded.summary,
    content_json = excluded.content_json,
    is_final_exam = excluded.is_final_exam,
    is_published = excluded.is_published,
    sort_order = excluded.sort_order,
    updated_at = now();

insert into exam_questions (sort_order, type, prompt, options, correct_answer, score, is_active)
values
(1, 'MCQ', '员工在向客户介绍交易产品时，最重要的合规原则是什么？', '["承诺收益","只说明优势","充分风险提示","引导客户满仓"]'::jsonb, '充分风险提示', 10, true),
(2, 'TRUE_FALSE', '员工账号应由管理员创建，员工不应自行公开注册。', '["正确","错误"]'::jsonb, '正确', 10, true),
(3, 'MCQ', '客户出金失败时，员工首先应检查哪类信息？', '["客户生日","KYC 与账户资料状态","客户交易盈利","客户使用的浏览器"]'::jsonb, 'KYC 与账户资料状态', 10, true),
(4, 'TRUE_FALSE', '浏览器切换到其他标签页时，培训有效学习时间仍应继续计时。', '["正确","错误"]'::jsonb, '错误', 10, true),
(5, 'MCQ', 'MT4/MT5 中挂单的常见用途是什么？', '["自动完成 KYC","在指定价格触发交易","修改员工权限","计算返佣"]'::jsonb, '在指定价格触发交易', 10, true),
(6, 'MCQ', 'IB 返佣沟通中不应出现哪类行为？', '["解释规则","说明结算周期","承诺不受市场风险影响","确认合作资料"]'::jsonb, '承诺不受市场风险影响', 10, true),
(7, 'TRUE_FALSE', '员工离职后，管理员停用账号即可阻止其再次登录。', '["正确","错误"]'::jsonb, '正确', 10, true),
(8, 'MCQ', '滑点通常与下列哪项更相关？', '["市场波动与流动性","员工头像","CRM 主题颜色","PDF 文件大小"]'::jsonb, '市场波动与流动性', 10, true),
(9, 'SHORT_TEXT', '请简述客户沟通中为什么必须进行风险提示。', null, '需说明交易风险，避免误导客户，保护客户知情权并满足合规要求。', 10, true),
(10, 'SHORT_TEXT', '请写出 CRM 跟进记录至少应包含的两项信息。', null, '客户需求、沟通时间、沟通内容、下一步计划等。', 10, true)
on conflict (sort_order) do update
set type = excluded.type,
    prompt = excluded.prompt,
    options = excluded.options,
    correct_answer = excluded.correct_answer,
    score = excluded.score,
    is_active = excluded.is_active,
    updated_at = now();
