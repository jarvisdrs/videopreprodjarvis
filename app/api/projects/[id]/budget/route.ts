import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { createBudgetSchema, paginationSchema } from "@/lib/validations"

/**
 * GET /api/projects/[id]/budget
 * Lista voci di budget di un progetto
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

    const category = searchParams.get("category") as string | undefined
    const status = searchParams.get("status") as string | undefined

    // Build where clause
    const where: any = {
      projectId: params.id,
      deletedAt: null,
    }

    if (category) where.category = category
    if (status) where.status = status

    // Query con pagination
    const skip = (page - 1) * limit

    const [budgets, total] = await Promise.all([
      prisma.budget.findMany({
        where,
        orderBy: [{ category: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.budget.count({ where }),
    ])

    return NextResponse.json({
      data: budgets,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("GET /api/projects/[id]/budget error:", error)
    return NextResponse.json(
      { error: "Failed to fetch budget" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/projects/[id]/budget
 * Crea una nuova voce di budget
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
    const validated = createBudgetSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validated.error.flatten() },
        { status: 400 }
      )
    }

    // Converti date
    const data = validated.data as any
    if (data.paidDate) data.paidDate = new Date(data.paidDate)

    const budget = await prisma.budget.create({
      data: {
        ...data,
        projectId: params.id,
      },
    })

    return NextResponse.json({ data: budget }, { status: 201 })
  } catch (error) {
    console.error("POST /api/projects/[id]/budget error:", error)
    return NextResponse.json(
      { error: "Failed to create budget item" },
      { status: 500 }
    )
  }
}
