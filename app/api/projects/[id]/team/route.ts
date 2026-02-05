import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { createTeamMemberSchema } from "@/lib/validations"

/**
 * GET /api/projects/[id]/team
 * Lista membri del team
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

    const teamMembers = await prisma.teamMember.findMany({
      where: {
        projectId: params.id,
        deletedAt: null,
      },
      orderBy: [{ role: "asc" }, { name: "asc" }],
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    })

    // Calcola statistiche
    const stats = {
      total: teamMembers.length,
      byRole: teamMembers.reduce((acc, member) => {
        acc[member.role] = (acc[member.role] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      totalDailyRate: teamMembers.reduce(
        (sum, m) => sum + (m.dailyRate || 0),
        0
      ),
      withUserAccount: teamMembers.filter((m) => m.userId).length,
    }

    return NextResponse.json({
      data: teamMembers,
      stats,
    })
  } catch (error) {
    console.error("GET /api/projects/[id]/team error:", error)
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/projects/[id]/team
 * Aggiungi membro al team
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
    const validated = createTeamMemberSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validated.error.flatten() },
        { status: 400 }
      )
    }

    // Se c'è userId, verifica che esista
    if (validated.data.userId) {
      const user = await prisma.user.findUnique({
        where: { id: validated.data.userId },
      })
      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 400 }
        )
      }
    }

    // Verifica duplicato email (se fornita)
    if (validated.data.email) {
      const existing = await prisma.teamMember.findFirst({
        where: {
          projectId: params.id,
          email: validated.data.email,
          deletedAt: null,
        },
      })
      if (existing) {
        return NextResponse.json(
          { error: "Team member with this email already exists" },
          { status: 409 }
        )
      }
    }

    const teamMember = await prisma.teamMember.create({
      data: {
        ...validated.data,
        projectId: params.id,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    })

    return NextResponse.json({ data: teamMember }, { status: 201 })
  } catch (error) {
    console.error("POST /api/projects/[id]/team error:", error)
    return NextResponse.json(
      { error: "Failed to add team member" },
      { status: 500 }
    )
  }
}
