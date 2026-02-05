import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { BudgetCategory } from "@prisma/client"

/**
 * GET /api/projects/[id]/budget/summary
 * Riepilogo completo del budget
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

    // Recupera tutte le statistiche budget
    const [
      budgetByCategory,
      budgetByStatus,
      totalEstimated,
      totalActual,
      recentItems,
      largestItems,
    ] = await Promise.all([
      // Budget raggruppato per categoria
      prisma.budget.groupBy({
        by: ["category"],
        where: { projectId: params.id, deletedAt: null },
        _sum: { estimated: true, actual: true },
        _count: { category: true },
      }),

      // Budget raggruppato per status
      prisma.budget.groupBy({
        by: ["status"],
        where: { projectId: params.id, deletedAt: null },
        _sum: { estimated: true, actual: true },
        _count: { status: true },
      }),

      // Totale stimato
      prisma.budget.aggregate({
        where: { projectId: params.id, deletedAt: null },
        _sum: { estimated: true },
      }),

      // Totale effettivo
      prisma.budget.aggregate({
        where: { projectId: params.id, deletedAt: null },
        _sum: { actual: true },
      }),

      // Voci recenti
      prisma.budget.findMany({
        where: { projectId: params.id, deletedAt: null },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),

      // Voci più costose
      prisma.budget.findMany({
        where: { projectId: params.id, deletedAt: null },
        orderBy: { estimated: "desc" },
        take: 5,
      }),
    ])

    // Calcola metriche
    const estimatedTotal = totalEstimated._sum.estimated || 0
    const actualTotal = totalActual._sum.actual || 0
    const variance = actualTotal - estimatedTotal
    const variancePercent = estimatedTotal > 0 ? (variance / estimatedTotal) * 100 : 0

    // Project budget (se impostato)
    const projectBudget = project.totalBudget || 0
    const budgetUtilization = projectBudget > 0 ? (actualTotal / projectBudget) * 100 : 0

    // Formatta per categoria
    const categories = Object.values(BudgetCategory).map((cat) => {
      const catData = budgetByCategory.find((b) => b.category === cat)
      return {
        category: cat,
        estimated: catData?._sum.estimated || 0,
        actual: catData?._sum.actual || 0,
        count: catData?._count.category || 0,
        variance: (catData?._sum.actual || 0) - (catData?._sum.estimated || 0),
      }
    })

    // Calcola trend mensile (ultimi 6 mesi)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyTrend = await prisma.budget.groupBy({
      by: ["status"],
      where: {
        projectId: params.id,
        deletedAt: null,
        updatedAt: { gte: sixMonthsAgo },
      },
      _sum: { actual: true },
    })

    return NextResponse.json({
      data: {
        summary: {
          estimatedTotal,
          actualTotal,
          variance,
          variancePercent,
          projectBudget,
          budgetUtilization,
          remainingBudget: projectBudget > 0 ? projectBudget - actualTotal : null,
          status:
            variancePercent > 10
              ? "over_budget"
              : variancePercent > 0
              ? "at_risk"
              : "on_track",
        },
        byCategory: categories,
        byStatus: budgetByStatus.map((b) => ({
          status: b.status,
          estimated: b._sum.estimated || 0,
          actual: b._sum.actual || 0,
          count: b._count.status,
        })),
        recentItems,
        largestItems,
        monthlySpend: monthlyTrend,
      },
    })
  } catch (error) {
    console.error("GET /api/projects/[id]/budget/summary error:", error)
    return NextResponse.json(
      { error: "Failed to fetch budget summary" },
      { status: 500 }
    )
  }
}
