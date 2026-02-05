import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { createTaskSchema, paginationSchema } from "@/lib/validations"
import { TaskStatus } from "@prisma/client"

/**
 * GET /api/projects/[id]/tasks
 * Lista task di un progetto
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

    // Parse query params
    const { searchParams } = new URL(req.url)
    const { page, limit } = paginationSchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    })

    const status = searchParams.get("status") as TaskStatus | undefined
    const priority = searchParams.get("priority") as string | undefined
    const assignedToId = searchParams.get("assignedToId") as string | undefined
    const parentOnly = searchParams.get("parentOnly") === "true"

    // Build where clause
    const where: any = {
      projectId: params.id,
      deletedAt: null,
    }

    if (status) where.status = status
    if (priority) where.priority = priority
    if (assignedToId) where.assignedToId = assignedToId
    if (parentOnly) where.parentId = null

    // Query con pagination
    const skip = (page - 1) * limit

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: [{ priority: "desc" }, { dueDate: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true, image: true },
          },
          _count: {
            select: { subtasks: true },
          },
        },
      }),
      prisma.task.count({ where }),
    ])

    return NextResponse.json({
      data: tasks,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("GET /api/projects/[id]/tasks error:", error)
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/projects/[id]/tasks
 * Crea un nuovo task
 */
export async function POST(
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

    // Validazione body
    const body = await req.json()
    const validated = createTaskSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validated.error.flatten() },
        { status: 400 }
      )
    }

    // Converti date strings
    const data = validated.data as any
    if (data.startDate) data.startDate = new Date(data.startDate)
    if (data.dueDate) data.dueDate = new Date(data.dueDate)

    // Se c'è un parentId, verifica che esista
    if (data.parentId) {
      const parent = await prisma.task.findFirst({
        where: { id: data.parentId, projectId: params.id, deletedAt: null },
      })
      if (!parent) {
        return NextResponse.json(
          { error: "Parent task not found" },
          { status: 400 }
        )
      }
    }

    // Se c'è assignedToId, verifica che l'utente sia nel team
    if (data.assignedToId) {
      const teamMember = await prisma.teamMember.findFirst({
        where: {
          projectId: params.id,
          OR: [{ userId: data.assignedToId }, { id: data.assignedToId }],
          deletedAt: null,
        },
      })
      // Nota: potremmo voler permettere l'assegnazione anche a utenti non nel team
      // ma per ora lo permettiamo per semplicità
    }

    const task = await prisma.task.create({
      data: {
        ...data,
        projectId: params.id,
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, image: true },
        },
        _count: {
          select: { subtasks: true },
        },
      },
    })

    return NextResponse.json({ data: task }, { status: 201 })
  } catch (error) {
    console.error("POST /api/projects/[id]/tasks error:", error)
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    )
  }
}
