import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { updateScriptSchema } from "@/lib/validations"

// Helper per verificare ownership progetto
async function verifyProjectOwnership(projectId: string, userId: string) {
  return prisma.project.findFirst({
    where: { id: projectId, userId, deletedAt: null },
  })
}

/**
 * GET /api/projects/[id]/scripts/[scriptId]
 * Dettaglio script con scene
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; scriptId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verifica ownership progetto
    const project = await verifyProjectOwnership(params.id, session.user.id)
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const script = await prisma.script.findFirst({
      where: {
        id: params.scriptId,
        projectId: params.id,
        deletedAt: null,
      },
      include: {
        scenes: {
          orderBy: { number: "asc" },
          include: {
            shots: {
              orderBy: { number: "asc" },
            },
          },
        },
        _count: {
          select: { scenes: true, files: true },
        },
      },
    })

    if (!script) {
      return NextResponse.json({ error: "Script not found" }, { status: 404 })
    }

    return NextResponse.json({ data: script })
  } catch (error) {
    console.error("GET /api/projects/[id]/scripts/[scriptId] error:", error)
    return NextResponse.json(
      { error: "Failed to fetch script" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/projects/[id]/scripts/[scriptId]
 * Aggiorna script
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; scriptId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verifica ownership progetto
    const project = await verifyProjectOwnership(params.id, session.user.id)
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Verifica script esiste
    const existing = await prisma.script.findFirst({
      where: {
        id: params.scriptId,
        projectId: params.id,
        deletedAt: null,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Script not found" }, { status: 404 })
    }

    // Validazione body
    const body = await req.json()
    const validated = updateScriptSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validated.error.flatten() },
        { status: 400 }
      )
    }

    // Incrementa versione se content cambia
    const data = validated.data as any
    if (data.content && data.content !== existing.content) {
      data.version = existing.version + 1
    }

    const script = await prisma.script.update({
      where: { id: params.scriptId },
      data,
    })

    return NextResponse.json({ data: script })
  } catch (error) {
    console.error("PUT /api/projects/[id]/scripts/[scriptId] error:", error)
    return NextResponse.json(
      { error: "Failed to update script" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/projects/[id]/scripts/[scriptId]
 * Soft delete script
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; scriptId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verifica ownership progetto
    const project = await verifyProjectOwnership(params.id, session.user.id)
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Verifica script esiste
    const existing = await prisma.script.findFirst({
      where: {
        id: params.scriptId,
        projectId: params.id,
        deletedAt: null,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Script not found" }, { status: 404 })
    }

    // Soft delete
    await prisma.script.update({
      where: { id: params.scriptId },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/projects/[id]/scripts/[scriptId] error:", error)
    return NextResponse.json(
      { error: "Failed to delete script" },
      { status: 500 }
    )
  }
}
