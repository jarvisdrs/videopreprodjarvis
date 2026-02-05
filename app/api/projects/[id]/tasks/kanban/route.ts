import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { TaskStatus } from "@prisma/client"

/**
 * GET /api/projects/[id]/tasks/kanban
 * Board kanban con task raggruppate per status
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

    // Verifica ownership progetto
    const project = await prisma.project.findFirst({
      where: { id: params.id, userId: session.user.id, deletedAt: null },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Prendi tutti i task non cancellati
    const tasks = await prisma.task.findMany({
      where: {
        projectId: params.id,
        deletedAt: null,
        parentId: null, // Solo task principali, non subtasks
      },
      orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, image: true },
        },
        _count: {
          select: { subtasks: true },
        },
      },
    })

    // Raggruppa per status
    const columns = {
      [TaskStatus.TODO]: {
        id: TaskStatus.TODO,
        title: "To Do",
        color: "#6B7280",
        tasks: [] as typeof tasks,
      },
      [TaskStatus.IN_PROGRESS]: {
        id: TaskStatus.IN_PROGRESS,
        title: "In Progress",
        color: "#3B82F6",
        tasks: [] as typeof tasks,
      },
      [TaskStatus.BLOCKED]: {
        id: TaskStatus.BLOCKED,
        title: "Blocked",
        color: "#EF4444",
        tasks: [] as typeof tasks,
      },
      [TaskStatus.REVIEW]: {
        id: TaskStatus.REVIEW,
        title: "Review",
        color: "#F59E0B",
        tasks: [] as typeof tasks,
      },
      [TaskStatus.COMPLETED]: {
        id: TaskStatus.COMPLETED,
        title: "Completed",
        color: "#10B981",
        tasks: [] as typeof tasks,
      },
      [TaskStatus.CANCELLED]: {
        id: TaskStatus.CANCELLED,
        title: "Cancelled",
        color: "#9CA3AF",
        tasks: [] as typeof tasks,
      },
    }

    // Distribuisci task nelle colonne
    tasks.forEach((task) => {
      if (columns[task.status]) {
        columns[task.status].tasks.push(task)
      }
    })

    // Calcola statistiche
    const stats = {
      total: tasks.length,
      byStatus: Object.fromEntries(
        Object.values(TaskStatus).map((status) => [
          status,
          tasks.filter((t) => t.status === status).length,
        ])
      ),
      byPriority: Object.fromEntries(
        ["LOW", "MEDIUM", "HIGH", "URGENT"].map((priority) => [
          priority,
          tasks.filter((t) => t.priority === priority).length,
        ])
      ),
      overdue: tasks.filter(
        (t) =>
          t.dueDate &&
          new Date(t.dueDate) < new Date() &&
          t.status !== TaskStatus.COMPLETED &&
          t.status !== TaskStatus.CANCELLED
      ).length,
      dueThisWeek: tasks.filter((t) => {
        if (!t.dueDate) return false
        const due = new Date(t.dueDate)
        const now = new Date()
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        return due >= now && due <= weekFromNow
      }).length,
    }

    return NextResponse.json({
      data: {
        columns: Object.values(columns),
        stats,
      },
    })
  } catch (error) {
    console.error("GET /api/projects/[id]/tasks/kanban error:", error)
    return NextResponse.json(
      { error: "Failed to fetch kanban board" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/projects/[id]/tasks/kanban
 * Bulk update task positions (per drag & drop)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const project = await prisma.project.findFirst({
      where: { id: params.id, userId: session.user.id, deletedAt: null },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const body = await req.json()
    const { updates } = body as { updates: { taskId: string; status: TaskStatus }[] }

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: "Invalid updates array" },
        { status: 400 }
      )
    }

    // Verifica che tutti i task appartengano al progetto
    const taskIds = updates.map((u) => u.taskId)
    const existingTasks = await prisma.task.findMany({
      where: {
        id: { in: taskIds },
        projectId: params.id,
        deletedAt: null,
      },
      select: { id: true },
    })

    const existingIds = new Set(existingTasks.map((t) => t.id))
    const invalidIds = taskIds.filter((id) => !existingIds.has(id))

    if (invalidIds.length > 0) {
      return NextResponse.json(
        { error: "Some tasks not found", invalidIds },
        { status: 400 }
      )
    }

    // Esegui updates in transazione
    await prisma.$transaction(
      updates.map((update) =>
        prisma.task.update({
          where: { id: update.taskId },
          data: {
            status: update.status,
            completedAt: update.status === TaskStatus.COMPLETED ? new Date() : null,
          },
        })
      )
    )

    return NextResponse.json({ success: true, updated: updates.length })
  } catch (error) {
    console.error("PATCH /api/projects/[id]/tasks/kanban error:", error)
    return NextResponse.json(
      { error: "Failed to update kanban board" },
      { status: 500 }
    )
  }
}
