import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { updateTaskSchema } from "@/lib/validations"
import { TaskStatus } from "@prisma/client"

// Helper per verificare ownership progetto
async function verifyProjectOwnership(projectId: string, userId: string) {
  return prisma.project.findFirst({
    where: { id: projectId, userId, deletedAt: null },
  })
}

/**
 * GET /api/projects/[id]/tasks/[taskId]
 * Dettaglio task con subtasks
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const project = await verifyProjectOwnership(params.id, session.user.id)
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const task = await prisma.task.findFirst({
      where: {
        id: params.taskId,
        projectId: params.id,
        deletedAt: null,
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, image: true },
        },
        subtasks: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          include: {
            assignedTo: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
        parent: {
          select: { id: true, title: true, status: true },
        },
      },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json({ data: task })
  } catch (error) {
    console.error("GET /api/projects/[id]/tasks/[taskId] error:", error)
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/projects/[id]/tasks/[taskId]
 * Aggiorna task
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const project = await verifyProjectOwnership(params.id, session.user.id)
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const existing = await prisma.task.findFirst({
      where: {
        id: params.taskId,
        projectId: params.id,
        deletedAt: null,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    const body = await req.json()
    const validated = updateTaskSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const data = validated.data as any

    // Converti date
    if (data.startDate) data.startDate = new Date(data.startDate)
    if (data.dueDate) data.dueDate = new Date(data.dueDate)
    if (data.completedAt) data.completedAt = new Date(data.completedAt)

    // Auto-set completedAt se status diventa COMPLETED
    if (data.status === TaskStatus.COMPLETED && !existing.completedAt) {
      data.completedAt = new Date()
    }

    // Auto-clear completedAt se status non è più COMPLETED
    if (data.status && data.status !== TaskStatus.COMPLETED && existing.completedAt) {
      data.completedAt = null
    }

    const task = await prisma.task.update({
      where: { id: params.taskId },
      data,
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, image: true },
        },
        subtasks: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    return NextResponse.json({ data: task })
  } catch (error) {
    console.error("PUT /api/projects/[id]/tasks/[taskId] error:", error)
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/projects/[id]/tasks/[taskId]
 * Soft delete task (e subtasks)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const project = await verifyProjectOwnership(params.id, session.user.id)
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const existing = await prisma.task.findFirst({
      where: {
        id: params.taskId,
        projectId: params.id,
        deletedAt: null,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Soft delete task e subtasks
    await prisma.$transaction([
      prisma.task.update({
        where: { id: params.taskId },
        data: { deletedAt: new Date() },
      }),
      prisma.task.updateMany({
        where: { parentId: params.taskId },
        data: { deletedAt: new Date() },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/projects/[id]/tasks/[taskId] error:", error)
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    )
  }
}
