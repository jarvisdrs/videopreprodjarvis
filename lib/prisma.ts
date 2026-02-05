import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Helper per query con soft delete
export const excludeSoftDeleted = {
  deletedAt: null,
}

// Helper per filtrare progetti accessibili all'utente
export async function getUserProjects(userId: string) {
  return prisma.project.findMany({
    where: {
      userId,
      deletedAt: null,
    },
    include: {
      _count: {
        select: {
          tasks: true,
          scripts: true,
          teamMembers: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })
}

// Helper per dashboard stats
export async function getProjectStats(projectId: string) {
  const [
    tasksByStatus,
    budgetSummary,
    upcomingTasks,
    teamCount,
  ] = await Promise.all([
    prisma.task.groupBy({
      by: ['status'],
      where: { projectId, deletedAt: null },
      _count: { id: true },
    }),
    prisma.budget.aggregate({
      where: { projectId, deletedAt: null },
      _sum: { estimated: true, actual: true },
    }),
    prisma.task.findMany({
      where: { 
        projectId, 
        deletedAt: null,
        status: { not: 'COMPLETED' },
        dueDate: { gte: new Date() },
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
    }),
    prisma.teamMember.count({
      where: { projectId, deletedAt: null },
    }),
  ])

  return {
    tasksByStatus,
    budgetSummary,
    upcomingTasks,
    teamCount,
  }
}

export default prisma
