import { PrismaClient, QuestionType, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const trainingDays = [
  {
    dayNumber: 1,
    title: "公司介绍与合规基础",
    summary: "了解 TMGM 品牌、Chelsea 合作调性、员工行为规范、基础监管与合规边界。",
    contentJson: {
      blocks: [
        { type: "heading", text: "学习目标" },
        { type: "paragraph", text: "掌握公司业务范围、品牌价值、员工合规红线和客户沟通中的基础免责声明。" },
        { type: "checklist", items: ["公司与品牌定位", "金融服务合规常识", "员工信息安全要求", "客户风险提示表达"] },
        { type: "paragraph", text: "这里是可编辑内容模板。后续可以替换为内部文档、图片、视频、PDF 或外部链接。" }
      ]
    }
  },
  {
    dayNumber: 2,
    title: "TMGM 产品与账户类型",
    summary: "熟悉账户类型、交易产品、点差与佣金基础表达。",
    contentJson: {
      blocks: [
        { type: "heading", text: "学习目标" },
        { type: "paragraph", text: "理解不同账户类型的定位，并能向客户清楚解释产品类别和费用结构。" },
        { type: "checklist", items: ["账户类型", "产品分类", "交易成本", "常见客户问题"] }
      ]
    }
  },
  {
    dayNumber: 3,
    title: "MT4 / MT5 基础操作",
    summary: "学习平台安装、登录、图表、订单、历史记录和常见问题排查。",
    contentJson: {
      blocks: [
        { type: "heading", text: "平台操作模板" },
        { type: "paragraph", text: "可在此放置 MT4/MT5 操作截图、演示视频和下载链接。" },
        { type: "checklist", items: ["平台登录", "图表与指标", "市价单与挂单", "交易历史导出"] }
      ]
    }
  },
  {
    dayNumber: 4,
    title: "入金、出金、KYC 流程",
    summary: "掌握客户开户、身份认证、资金流转和异常流程处理。",
    contentJson: {
      blocks: [
        { type: "heading", text: "流程训练" },
        { type: "paragraph", text: "本页面用于沉淀 KYC 审核标准、入出金材料说明、常见失败原因和升级路径。" },
        { type: "checklist", items: ["KYC 材料", "入金路径", "出金规则", "异常工单"] }
      ]
    }
  },
  {
    dayNumber: 5,
    title: "IB 代理合作与返佣逻辑",
    summary: "了解代理层级、返佣计算、归属关系和合规沟通边界。",
    contentJson: {
      blocks: [
        { type: "heading", text: "IB 合作基础" },
        { type: "paragraph", text: "后续可替换为真实返佣政策、内部审批规则和案例说明。" },
        { type: "checklist", items: ["代理类型", "返佣口径", "客户归属", "禁止承诺事项"] }
      ]
    }
  },
  {
    dayNumber: 6,
    title: "客户沟通与销售话术",
    summary: "训练企业化沟通方式、需求识别、异议处理和风险提示。",
    contentJson: {
      blocks: [
        { type: "heading", text: "沟通训练" },
        { type: "paragraph", text: "本页面可放置话术库、录音示例、角色扮演材料和客户分层处理方式。" },
        { type: "checklist", items: ["开场与需求确认", "产品说明", "异议处理", "合规收尾"] }
      ]
    }
  },
  {
    dayNumber: 7,
    title: "风控、滑点、点差、市场深度",
    summary: "理解交易执行、流动性、市场波动和风控沟通。",
    contentJson: {
      blocks: [
        { type: "heading", text: "交易风控理解" },
        { type: "paragraph", text: "可补充市场深度图、报价波动案例、滑点解释模板和风险事件复盘。" },
        { type: "checklist", items: ["点差", "滑点", "流动性", "市场深度", "异常行情沟通"] }
      ]
    }
  },
  {
    dayNumber: 8,
    title: "CRM 系统操作与客户管理",
    summary: "掌握客户资料维护、跟进记录、线索阶段、任务提醒和数据安全。",
    contentJson: {
      blocks: [
        { type: "heading", text: "CRM 操作训练" },
        { type: "paragraph", text: "本页面用于承载 CRM 操作截图、客户生命周期说明和字段规范。" },
        { type: "checklist", items: ["客户建档", "跟进记录", "任务提醒", "数据导出规范"] }
      ]
    }
  }
];

const questions = [
  {
    type: QuestionType.MCQ,
    prompt: "员工在向客户介绍交易产品时，最重要的合规原则是什么？",
    options: ["承诺收益", "只说明优势", "充分风险提示", "引导客户满仓"],
    correctAnswer: "充分风险提示"
  },
  {
    type: QuestionType.TRUE_FALSE,
    prompt: "员工账号应由管理员创建，员工不应自行公开注册。",
    options: ["正确", "错误"],
    correctAnswer: "正确"
  },
  {
    type: QuestionType.MCQ,
    prompt: "客户出金失败时，员工首先应检查哪类信息？",
    options: ["客户生日", "KYC 与账户资料状态", "客户交易盈利", "客户使用的浏览器"],
    correctAnswer: "KYC 与账户资料状态"
  },
  {
    type: QuestionType.TRUE_FALSE,
    prompt: "浏览器切换到其他标签页时，培训有效学习时间仍应继续计时。",
    options: ["正确", "错误"],
    correctAnswer: "错误"
  },
  {
    type: QuestionType.MCQ,
    prompt: "MT4/MT5 中挂单的常见用途是什么？",
    options: ["自动完成 KYC", "在指定价格触发交易", "修改员工权限", "计算返佣"],
    correctAnswer: "在指定价格触发交易"
  },
  {
    type: QuestionType.MCQ,
    prompt: "IB 返佣沟通中不应出现哪类行为？",
    options: ["解释规则", "说明结算周期", "承诺不受市场风险影响", "确认合作资料"],
    correctAnswer: "承诺不受市场风险影响"
  },
  {
    type: QuestionType.TRUE_FALSE,
    prompt: "员工离职后，管理员停用账号即可阻止其再次登录。",
    options: ["正确", "错误"],
    correctAnswer: "正确"
  },
  {
    type: QuestionType.MCQ,
    prompt: "滑点通常与下列哪项更相关？",
    options: ["市场波动与流动性", "员工头像", "CRM 主题颜色", "PDF 文件大小"],
    correctAnswer: "市场波动与流动性"
  },
  {
    type: QuestionType.SHORT_TEXT,
    prompt: "请简述客户沟通中为什么必须进行风险提示。",
    options: null,
    correctAnswer: "需说明交易风险，避免误导客户，保护客户知情权并满足合规要求。"
  },
  {
    type: QuestionType.SHORT_TEXT,
    prompt: "请写出 CRM 跟进记录至少应包含的两项信息。",
    options: null,
    correctAnswer: "客户需求、沟通时间、沟通内容、下一步计划等。"
  }
];

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@tmgm.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin@123456";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, role: Role.ADMIN, status: "ACTIVE" },
    create: {
      email: adminEmail,
      passwordHash,
      role: Role.ADMIN,
      status: "ACTIVE"
    }
  });

  for (const day of trainingDays) {
    await prisma.trainingDay.upsert({
      where: { dayNumber: day.dayNumber },
      update: {
        title: day.title,
        summary: day.summary,
        contentJson: day.contentJson,
        sortOrder: day.dayNumber,
        isFinalExam: false
      },
      create: {
        ...day,
        sortOrder: day.dayNumber,
        isFinalExam: false
      }
    });
  }

  await prisma.trainingDay.upsert({
    where: { dayNumber: 99 },
    update: {
      title: "Final Exam: 综合考试",
      summary: "完成 8 天培训后进行综合考试。",
      contentJson: { blocks: [{ type: "paragraph", text: "考试题目可在管理员后台维护。" }] },
      sortOrder: 99,
      isFinalExam: true
    },
    create: {
      dayNumber: 99,
      title: "Final Exam: 综合考试",
      summary: "完成 8 天培训后进行综合考试。",
      contentJson: { blocks: [{ type: "paragraph", text: "考试题目可在管理员后台维护。" }] },
      sortOrder: 99,
      isFinalExam: true
    }
  });

  for (const [index, question] of questions.entries()) {
    await prisma.examQuestion.upsert({
      where: { sortOrder: index + 1 },
      update: { ...question, score: 10, isActive: true },
      create: { ...question, score: 10, sortOrder: index + 1, isActive: true }
    });
  }

  console.log(`Seed complete. Admin: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
