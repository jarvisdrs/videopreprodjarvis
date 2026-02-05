import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { createScriptSchema, paginationSchema } from "@/lib/validations"

/**
 * GET /api/projects/[id]/scripts
 * Lista script di un progetto
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

    const type = searchParams.get("type") as string | undefined
    const status = searchParams.get("status") as string | undefined

    // Build where clause
    const where: any = {
      projectId: params.id,
      deletedAt: null,
    }

    if (type) where.type = type
    if (status) where.status = status

    // Query con pagination
    const skip = (page - 1) * limit

    const [scripts, total] = await Promise.all([
      prisma.script.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
        include: {
          _count: {
            select: { scenes: true },
          },
        },
      }),
      prisma.script.count({ where }),
    ])

    return NextResponse.json({
      data: scripts,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("GET /api/projects/[id]/scripts error:", error)
    return NextResponse.json(
      { error: "Failed to fetch scripts" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/projects/[id]/scripts
 * Crea un nuovo script
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
    const validated = createScriptSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validated.error.flatten() },
        { status: 400 }
      )
    }

    // Crea script
    const script = await prisma.script.create({
      data: {
        ...validated.data,
        projectId: params.id,
      },
    })

    return NextResponse.json({ data: script }, { status: 201 })
  } catch (error) {
    console.error("POST /api/projects/[id]/scripts error:", error)
    return NextResponse.json(
      { error: "Failed to create script" },
      { status: 500 }
    )
  }
}
