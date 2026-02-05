import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { TaskStatus, BudgetCategory } from "@prisma/client"

/**
 * GET /api/projects/[id]/stats
 * Statistiche dettagliate del progetto
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verifica ownership
    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
        deletedAt: null,
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Raccogli tutte le statistiche in parallelo
    const [
      taskStats,
      budgetStats,
      scriptCount,
      teamCount,
      locationCount,
      recentTasks,
      upcomingDeadlines,
    ] = await Promise.all([
      // Task statistics
      prisma.task.groupBy({
        by: ["status"],
        where: { projectId: params.id, deletedAt: null },
        _count: { status: true },
      }),

      // Budget statistics
      prisma.budget.groupBy({
        by: ["category", "status"],
        where: { projectId: params.id, deletedAt: null },
        _sum: { estimated: true, actual: true },
      }),

      // Script count
      prisma.script.count({
        where: { projectId: params.id, deletedAt: null },
      }),

      // Team count
      prisma.teamMember.count({
        where: { projectId: params.id, deletedAt: null },
      }),

      // Location count
      prisma.location.count({
        where: { projectId: params.id, deletedAt: null },
      }),

      // Recent tasks
      prisma.task.findMany({
        where: { projectId: params.id, deletedAt: null },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          dueDate: true,
        },
      }),

      // Upcoming deadlines (next 7 days)
      prisma.task.findMany({
        where: {
          projectId: params.id,
          deletedAt: null,
          dueDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
          status: { not: TaskStatus.COMPLETED },
        },
        orderBy: { dueDate: "asc" },
        select: {
          id: true,
          title: true,
          dueDate: true,
          priority: true,
        },
      }),
    ])

    // Calcola totali budget
    const totalEstimated = budgetStats.reduce((sum, b) => sum + (b._sum.estimated || 0), 0)
    const totalActual = budgetStats.reduce((sum, b) => sum + (b._sum.actual || 0), 0)

    // Raggruppa per categoria
    const budgetByCategory = Object.values(BudgetCategory).map((cat) => {
      const catStats = budgetStats.filter((b) => b.category === cat)
      return {
        category: cat,
        estimated: catStats.reduce((sum, b) => sum + (b._sum.estimated || 0), 0),
        actual: catStats.reduce((sum, b) => sum + (b._sum.actual || 0), 0),
      }
    })

    // Task stats object
    const taskCounts = {
      total: taskStats.reduce((sum, t) => sum + t._count.status, 0),
      todo: taskStats.find((t) => t.status === TaskStatus.TODO)?._count.status || 0,
      inProgress: taskStats.find((t) => t.status === TaskStatus.IN_PROGRESS)?._count.status || 0,
      blocked: taskStats.find((t) => t.status === TaskStatus.BLOCKED)?._count.status || 0,
      review: taskStats.find((t) => t.status === TaskStatus.REVIEW)?._count.status || 0,
      completed: taskStats.find((t) => t.status === TaskStatus.COMPLETED)?._count.status || 0,
    }

    return NextResponse.json({
      data: {
        overview: {
          scripts: scriptCount,
          tasks: taskCounts,
          team: teamCount,
          locations: locationCount,
        },
        tasks: taskStats,
        budget: {
          totalEstimated,
          totalActual,
          remaining: totalEstimated - totalActual,
          byCategory: budgetByCategory,
        },
        recentActivity: {
          tasks: recentTasks,
          upcomingDeadlines,
        },
        project: {
          id: project.id,
          name: project.name,
          status: project.status,
          totalBudget: project.totalBudget,
          deadline: project.deadline,
        },
      },
    })
  } catch (error) {
    console.error("GET /api/projects/[id]/stats error:", error)
    return NextResponse.json(
      { error: "Failed to fetch project stats" },
      { status: 500 }
    )
  }
}
