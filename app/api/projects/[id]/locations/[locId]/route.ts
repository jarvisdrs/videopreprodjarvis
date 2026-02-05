import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { updateLocationSchema } from "@/lib/validations"

// Helper per verificare ownership progetto
async function verifyProjectOwnership(projectId: string, userId: string) {
  return prisma.project.findFirst({
    where: { id: projectId, userId, deletedAt: null },
  })
}

/**
 * PUT /api/projects/[id]/locations/[locId]
 * Aggiorna location
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; locId: string } }
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

    const existing = await prisma.location.findFirst({
      where: {
        id: params.locId,
        projectId: params.id,
        deletedAt: null,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 })
    }

    const body = await req.json()
    const validated = updateLocationSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const location = await prisma.location.update({
      where: { id: params.locId },
      data: validated.data,
      include: {
        _count: {
          select: { files: true },
        },
      },
    })

    return NextResponse.json({ data: location })
  } catch (error) {
    console.error("PUT /api/projects/[id]/locations/[locId] error:", error)
    return NextResponse.json(
      { error: "Failed to update location" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/projects/[id]/locations/[locId]
 * Soft delete location
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; locId: string } }
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

    const existing = await prisma.location.findFirst({
      where: {
        id: params.locId,
        projectId: params.id,
        deletedAt: null,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 })
    }

    // Soft delete
    await prisma.location.update({
      where: { id: params.locId },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/projects/[id]/locations/[locId] error:", error)
    return NextResponse.json(
      { error: "Failed to delete location" },
      { status: 500 }
    )
  }
}
