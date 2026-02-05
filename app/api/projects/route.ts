import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { createProjectSchema, paginationSchema } from "@/lib/validations"

// Rate limiting: implementare con Redis o Upstash in produzione
// const rateLimit = new Map<string, { count: number; resetTime: number }>()

/**
 * GET /api/projects
 * Lista progetti dell'utente autenticato
 * Query params: ?page=1&limit=20&status=DRAFT
 */
export async function GET(req: NextRequest) {
  try {
    // Autenticazione
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse query params
    const { searchParams } = new URL(req.url)
    const { page, limit } = paginationSchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    })

    const status = searchParams.get("status") as string | undefined
    const search = searchParams.get("search") as string | undefined

    // Build where clause
    const where: any = {
      userId: session.user.id,
      deletedAt: null,
    }

    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    // Esegui query con pagination
    const skip = (page - 1) * limit

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
        include: {
          _count: {
            select: { tasks: true, scripts: true, teamMembers: true, locations: true },
          },
        },
      }),
      prisma.project.count({ where }),
    ])

    return NextResponse.json({
      data: projects,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("GET /api/projects error:", error)
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/projects
 * Crea un nuovo progetto
 */
export async function POST(req: NextRequest) {
  try {
    // Autenticazione
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validazione body
    const body = await req.json()
    const validated = createProjectSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validated.error.flatten() },
        { status: 400 }
      )
    }

    // Converti date strings in Date objects
    const data = validated.data
    if (data.startDate) data.startDate = new Date(data.startDate) as any
    if (data.deadline) data.deadline = new Date(data.deadline) as any

    // Crea progetto
    const project = await prisma.project.create({
      data: {
        ...validated.data,
        userId: session.user.id,
      } as any,
      include: {
        _count: {
          select: { tasks: true, scripts: true },
        },
      },
    })

    return NextResponse.json({ data: project }, { status: 201 })
  } catch (error) {
    console.error("POST /api/projects error:", error)
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    )
  }
}
