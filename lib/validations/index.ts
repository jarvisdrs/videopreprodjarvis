import { z } from "zod"
import { ProjectStatus, ScriptType, ScriptStatus, TaskStatus, TaskPriority, BudgetCategory, BudgetStatus, LocationType, LocationStatus, TeamRole } from "@prisma/client"

// ============================================
// PAGINATION SCHEMAS
// ============================================
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

export type PaginationInput = z.infer<typeof paginationSchema>

// ============================================
// PROJECT SCHEMAS
// ============================================
export const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  status: z.nativeEnum(ProjectStatus).default(ProjectStatus.DRAFT),
  totalBudget: z.number().positive().optional(),
  currency: z.string().default("EUR"),
  startDate: z.string().datetime().optional(),
  deadline: z.string().datetime().optional(),
  genre: z.string().max(100).optional(),
  duration: z.number().int().positive().optional(),
  format: z.string().max(50).optional(),
  target: z.string().max(500).optional(),
})

export const updateProjectSchema = createProjectSchema.partial()

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>

// ============================================
// SCRIPT SCHEMAS
// ============================================
export const createScriptSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().max(100000),
  type: z.nativeEnum(ScriptType).default(ScriptType.OUTLINE),
  status: z.nativeEnum(ScriptStatus).default(ScriptStatus.DRAFT),
  logline: z.string().max(1000).optional(),
  synopsis: z.string().max(5000).optional(),
  notes: z.string().max(10000).optional(),
})

export const updateScriptSchema = createScriptSchema.partial()

export const generateScriptSchema = z.object({
  projectId: z.string().cuid(),
  prompt: z.string().min(10).max(5000),
  type: z.nativeEnum(ScriptType).default(ScriptType.OUTLINE),
  tone: z.enum(["professional", "casual", "dramatic", "humorous", "documentary"]).default("professional"),
  duration: z.number().int().min(1).max(300).optional(), // minutes
})

export type CreateScriptInput = z.infer<typeof createScriptSchema>
export type UpdateScriptInput = z.infer<typeof updateScriptSchema>
export type GenerateScriptInput = z.infer<typeof generateScriptSchema>

// ============================================
// TASK SCHEMAS
// ============================================
export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  startDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  assignedToId: z.string().cuid().optional(),
  parentId: z.string().cuid().optional(),
})

export const updateTaskSchema = createTaskSchema.partial().extend({
  completedAt: z.string().datetime().optional(),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>

// ============================================
// BUDGET SCHEMAS
// ============================================
export const createBudgetSchema = z.object({
  category: z.nativeEnum(BudgetCategory),
  item: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  estimated: z.number().min(0).default(0),
  actual: z.number().min(0).optional(),
  quantity: z.number().int().min(1).default(1),
  unitCost: z.number().min(0).optional(),
  status: z.nativeEnum(BudgetStatus).default(BudgetStatus.ESTIMATED),
  paidDate: z.string().datetime().optional(),
  vendor: z.string().max(200).optional(),
  invoice: z.string().max(200).optional(),
})

export const updateBudgetSchema = createBudgetSchema.partial()

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>

// ============================================
// TEAM SCHEMAS
// ============================================
export const createTeamMemberSchema = z.object({
  role: z.nativeEnum(TeamRole).default(TeamRole.OTHER),
  customRole: z.string().max(100).optional(),
  name: z.string().min(1).max(200),
  email: z.string().email().max(200).optional(),
  phone: z.string().max(50).optional(),
  bio: z.string().max(2000).optional(),
  portfolio: z.string().url().max(500).optional(),
  dailyRate: z.number().min(0).optional(),
  currency: z.string().default("EUR"),
  userId: z.string().cuid().optional(),
})

export type CreateTeamMemberInput = z.infer<typeof createTeamMemberSchema>

// ============================================
// LOCATION SCHEMAS
// ============================================
export const createLocationSchema = z.object({
  name: z.string().min(1).max(200),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).default("Italia"),
  postalCode: z.string().max(20).optional(),
  type: z.nativeEnum(LocationType).default(LocationType.INTERIOR),
  description: z.string().max(5000).optional(),
  amenities: z.array(z.string().max(50)).default([]),
  dimensions: z.string().max(100).optional(),
  contactName: z.string().max(200).optional(),
  contactEmail: z.string().email().max(200).optional(),
  contactPhone: z.string().max(50).optional(),
  costPerDay: z.number().min(0).optional(),
  currency: z.string().default("EUR"),
  status: z.nativeEnum(LocationStatus).default(LocationStatus.SCOUTING),
  rating: z.number().int().min(1).max(5).optional(),
  notes: z.string().max(5000).optional(),
  photos: z.array(z.string().url()).default([]),
})

export const updateLocationSchema = createLocationSchema.partial()

export type CreateLocationInput = z.infer<typeof createLocationSchema>
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>
