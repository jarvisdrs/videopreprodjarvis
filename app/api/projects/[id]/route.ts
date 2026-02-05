import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { updateProjectSchema } from "@/lib/validations"

// Helper per verificare ownership
async function verifyProjectOwnership(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId, deletedAt: null },
  })
  return project
}

/**
 * GET /api/projects/[id]
 * Dettaglio progetto
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

    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
        deletedAt: null,
      },
      include: {
        scripts: {
          where: { deletedAt: null },
          orderBy: { updatedAt: "desc" },
          take: 5,
        },
        tasks: {
          where: { deletedAt: null },
          orderBy: { dueDate: "asc" },
          take: 10,
        },
        teamMembers: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
        },
        locations: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        _count: {
          select: {
            scripts: { where: { deletedAt: null } },
            tasks: { where: { deletedAt: null } },
            teamMembers: { where: { deletedAt: null } },
            locations: { where: { deletedAt: null } },
            budgets: { where: { deletedAt: null } },
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json({ data: project })
  } catch (error) {
    console.error("GET /api/projects/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/projects/[id]
 * Aggiorna progetto
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verifica ownership
    const existing = await verifyProjectOwnership(params.id, session.user.id)
    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Validazione body
    const body = await req.json()
    const validated = updateProjectSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validated.error.flatten() },
        { status: 400 }
      )
    }

    // Converti date strings
    const data = validated.data as any
    if (data.startDate) data.startDate = new Date(data.startDate)
    if (data.deadline) data.deadline = new Date(data.deadline)

    const project = await prisma.project.update({
      where: { id: params.id },
      data,
      include: {
        _count: {
          select: { tasks: true, scripts: true },
        },
      },
    })

    return NextResponse.json({ data: project })
  } catch (error) {
    console.error("PUT /api/projects/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/projects/[id]
 * Soft delete progetto
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verifica ownership
    const existing = await verifyProjectOwnership(params.id, session.user.id)
    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Soft delete
    await prisma.project.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    })

    // Soft delete anche delle entità collegate
    await Promise.all([
      prisma.script.updateMany({
        where: { projectId: params.id },
        data: { deletedAt: new Date() },
      }),
      prisma.task.updateMany({
        where: { projectId: params.id },
        data: { deletedAt: new Date() },
      }),
      prisma.budget.updateMany({
        where: { projectId: params.id },
        data: { deletedAt: new Date() },
      }),
      prisma.location.updateMany({
        where: { projectId: params.id },
        data: { deletedAt: new Date() },
      }),
      prisma.teamMember.updateMany({
        where: { projectId: params.id },
        data: { deletedAt: new Date() },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/projects/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    )
  }
}
