import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

/**
 * DELETE /api/projects/[id]/team/[memberId]
 * Rimuovi membro dal team (soft delete)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; memberId: string } }
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

    // Verifica che il membro esista
    const member = await prisma.teamMember.findFirst({
      where: {
        id: params.memberId,
        projectId: params.id,
        deletedAt: null,
      },
    })

    if (!member) {
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 }
      )
    }

    // Soft delete
    await prisma.teamMember.update({
      where: { id: params.memberId },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/projects/[id]/team/[memberId] error:", error)
    return NextResponse.json(
      { error: "Failed to remove team member" },
      { status: 500 }
    )
  }
}
