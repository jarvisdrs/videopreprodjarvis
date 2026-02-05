import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { createLocationSchema, paginationSchema } from "@/lib/validations"

/**
 * GET /api/projects/[id]/locations
 * Lista location del progetto
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

    const status = searchParams.get("status") as string | undefined
    const type = searchParams.get("type") as string | undefined
    const city = searchParams.get("city") as string | undefined

    // Build where clause
    const where: any = {
      projectId: params.id,
      deletedAt: null,
    }

    if (status) where.status = status
    if (type) where.type = type
    if (city) where.city = { contains: city, mode: "insensitive" }

    // Query con pagination
    const skip = (page - 1) * limit

    const [locations, total] = await Promise.all([
      prisma.location.findMany({
        where,
        orderBy: [{ status: "asc" }, { name: "asc" }],
        skip,
        take: limit,
        include: {
          _count: {
            select: { files: true },
          },
        },
      }),
      prisma.location.count({ where }),
    ])

    return NextResponse.json({
      data: locations,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("GET /api/projects/[id]/locations error:", error)
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/projects/[id]/locations
 * Crea una nuova location
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
    const validated = createLocationSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const location = await prisma.location.create({
      data: {
        ...validated.data,
        projectId: params.id,
      },
      include: {
        _count: {
          select: { files: true },
        },
      },
    })

    return NextResponse.json({ data: location }, { status: 201 })
  } catch (error) {
    console.error("POST /api/projects/[id]/locations error:", error)
    return NextResponse.json(
      { error: "Failed to create location" },
      { status: 500 }
    )
  }
}
