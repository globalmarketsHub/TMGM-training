# TMGM Chelsea Training CRM

深蓝金融科技风格的员工培训后台系统，基于 Next.js App Router、Tailwind CSS、Next.js API Routes、Prisma 和 PostgreSQL/Supabase。系统包含管理员 CRM、员工培训主页、8 天课程模板、隐藏有效学习计时、综合考试、题库维护、课程内容维护和 CSV/Excel 导出。

## 项目结构

```text
.
├─ app/
│  ├─ api/
│  │  ├─ auth/                 # 登录、退出、当前用户
│  │  ├─ admin/                # 员工、进度、导出、题库、课程管理 API
│  │  ├─ training/             # 员工课程、有效学习时间、完成进度 API
│  │  └─ exam/submit/          # 综合考试提交 API
│  ├─ admin/                   # 管理员 CRM 页面
│  ├─ login/                   # 登录页
│  └─ training/                # 员工培训与考试页面
├─ components/
│  ├─ admin/                   # 管理员表单与编辑组件
│  ├─ auth/                    # 登录组件
│  ├─ layout/                  # 左侧导航 + 顶部栏后台布局
│  ├─ training/                # 课程渲染、隐藏计时器、考试表单
│  └─ ui/                      # 通用数据卡片与状态标签
├─ lib/                        # Prisma、认证、密码、CSV、格式化、校验
├─ prisma/
│  ├─ schema.prisma            # 数据库模型
│  └─ seed.ts                  # 初始化管理员、8 天课程、10 道题
├─ sql/schema.sql              # PostgreSQL/Supabase 手动建表参考
└─ README.md
```

## 核心功能

- 员工账号只能由管理员创建，没有公开注册入口。
- 角色权限：`ADMIN` 管理员、`EMPLOYEE` 员工。
- 管理员可新增、停用、删除员工账号，查看员工列表、进度、每日有效学习时间、考试成绩、最后登录时间。
- 员工只能看到自己的培训主页、Day 1 到 Day 8 页面和综合考试。
- 每个 Day 支持文字、图片、视频、PDF 和链接，管理员可在“课程内容”页面替换模板。
- 综合考试支持选择题、判断题、简答题，管理员可维护题库。
- 支持导出 `CSV` 和 Excel 可打开的 `.xls`。

## 有效学习计时规则

计时器只在员工 Day 页面运行，不展示给员工。API 会按员工身份写入 `active_time_logs`，并汇总到 `training_progress.active_seconds`。

- 鼠标离开当前网页，不计时。
- 浏览器窗口失焦，不计时。
- 页面隐藏或切换标签页，不计时。
- 鼠标在页面上但 5 分钟没有任何操作，停止计时。
- 鼠标移动、点击、滚动、键盘操作后恢复计时。
- 视频播放时可绕过 5 分钟无操作限制；视频暂停后仍按空闲规则停止。
- 每个 Day 独立记录有效学习时间。
- 单次计时上报 API 限制为最多 120 秒，减少异常数据灌入风险。

## 数据库表

Prisma 模型和 `sql/schema.sql` 已包含以下表：

- `users`: 登录账号、密码哈希、角色、账号状态、最后登录时间。
- `employees`: 员工档案、员工编号、部门、职位、软删除时间。
- `training_days`: Day 1 到 Day 8 与 Final Exam 模板内容。
- `training_progress`: 员工每一天状态、完成时间、有效学习时间汇总。
- `active_time_logs`: 每次有效学习时间审计日志。
- `exam_questions`: 题库，支持选择题、判断题、简答题。
- `exam_answers`: 员工每题答案与得分。
- `exam_results`: 员工考试总分、是否通过、提交时间。

## 本地运行

1. 安装依赖：

```bash
npm install
```

2. 创建 `.env`：

```bash
cp .env.example .env
```

将 `DATABASE_URL` 改为你的 PostgreSQL 或 Supabase 连接串，并把 `JWT_SECRET` 改成至少 32 位的随机字符串。Vercel 生产环境建议使用 Supabase connection pooler 连接串。

3. 初始化数据库：

```bash
npm run db:push
npm run db:seed
```

默认 seed 管理员：

```text
admin@tmgm.local / Admin@123456
```

4. 启动开发环境：

```bash
npm run dev
```

打开 `http://localhost:3000`。

## Supabase 配置

1. 在 Supabase 创建新项目。
2. 进入 Project Settings → Database，复制 connection string。
3. 写入 `.env` 的 `DATABASE_URL`。
4. 在本地运行：

```bash
npm run db:push
npm run db:seed
```

也可以参考 `sql/schema.sql` 手动建表，但推荐使用 Prisma 管理结构。

## 部署到 GitHub + Vercel

1. 将项目推送到 GitHub。
2. 在 Vercel 新建项目，选择该仓库。
3. 在 Vercel Environment Variables 设置：

```text
DATABASE_URL
JWT_SECRET
NEXT_PUBLIC_APP_NAME
```

4. Build Command 使用默认 `npm run build`。
5. 首次部署前，先在本地连接生产数据库运行：

```bash
npm run db:push
npm run db:seed
```

生产环境建议 seed 后立即修改默认管理员密码，或通过环境变量设置更强的 `SEED_ADMIN_PASSWORD`。

## 安全说明

- 密码使用 `bcryptjs` 加密存储。
- 登录状态使用 httpOnly cookie + JWT。
- API 每次都会校验账号状态，停用或删除后无法继续登录和调用接口。
- 员工 API 只使用当前 session 的 `employeeId`，不能读取其他员工数据。
- 管理员 API 统一经过 `requireAdmin()` 权限校验。
- 删除员工使用软删除，保留历史学习和考试记录，账号状态改为 `DELETED` 后无法登录。

## 后续可扩展方向

- 增加管理员手动批改简答题。
- 将课程内容 JSON 升级为富文本编辑器。
- 增加部门、团队、课程版本和培训批次。
- 接入 Vercel Cron 定期导出培训报表。
