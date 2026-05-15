import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const createEmployeeSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  employeeCode: z.string().min(2).max(50),
  fullName: z.string().min(2).max(120),
  department: z.string().max(120).optional().nullable(),
  position: z.string().max(120).optional().nullable(),
  manager: z.string().max(120).optional().nullable()
});

export const updateEmployeeSchema = z.object({
  fullName: z.string().min(2).max(120).optional(),
  department: z.string().max(120).optional().nullable(),
  position: z.string().max(120).optional().nullable(),
  manager: z.string().max(120).optional().nullable(),
  status: z.enum(["ACTIVE", "DISABLED", "DELETED"]).optional()
});

export const activeTimeSchema = z.object({
  trainingDayId: z.string().uuid(),
  seconds: z.number().int().min(1).max(120),
  source: z.enum(["TIMER", "VIDEO"]).default("TIMER"),
  startedAt: z.string().datetime().optional(),
  endedAt: z.string().datetime().optional(),
  clientMeta: z.record(z.unknown()).optional()
});

export const progressSchema = z.object({
  trainingDayId: z.string().uuid(),
  status: z.enum(["IN_PROGRESS", "COMPLETED"])
});

export const submitExamSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      answerText: z.string().max(4000)
    })
  )
});

export const examQuestionSchema = z.object({
  type: z.enum(["MCQ", "TRUE_FALSE", "SHORT_TEXT"]),
  prompt: z.string().min(4),
  options: z.array(z.string()).nullable().optional(),
  correctAnswer: z.string().nullable().optional(),
  score: z.number().int().min(1).max(100),
  sortOrder: z.number().int().min(1),
  isActive: z.boolean().default(true)
});

export const trainingDayUpdateSchema = z.object({
  title: z.string().min(2).max(180),
  summary: z.string().min(2),
  contentJson: z.unknown(),
  videoUrl: z.string().url().optional().nullable().or(z.literal("")),
  pdfUrl: z.string().url().optional().nullable().or(z.literal("")),
  linkUrl: z.string().url().optional().nullable().or(z.literal("")),
  isPublished: z.boolean()
});
