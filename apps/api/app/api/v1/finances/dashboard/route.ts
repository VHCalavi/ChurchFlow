import { NextResponse } from "next/server";
import { prisma } from "@churchflow/database";
import { auth, getAuthUser, unauthorized } from "../../../../../lib/auth";

export async function GET() {
  const session = await auth();
  const user = getAuthUser(session);
  if (!user) return unauthorized();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [
    totalEntreesAgg,
    totalSortiesAgg,
    entreesThisMonthAgg,
    sortiesFonctionnementAgg,
    sortiesInvestissementAgg,
    sortiesExceptionnelAgg,
  ] = await Promise.all([
    prisma.transaction.aggregate({
      where: { churchId: user.churchId, type: "ENTREE" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { churchId: user.churchId, type: "SORTIE" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { churchId: user.churchId, type: "ENTREE", date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { churchId: user.churchId, type: "SORTIE", expenseFamily: "FONCTIONNEMENT" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { churchId: user.churchId, type: "SORTIE", expenseFamily: "INVESTISSEMENT" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { churchId: user.churchId, type: "SORTIE", expenseFamily: "EXCEPTIONNEL" },
      _sum: { amount: true },
    }),
  ]);

  // Évolution mensuelle sur 6 mois
  const months: { label: string; entrees: number; sorties: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
    const label = d.toLocaleString("fr-FR", { month: "short", year: "2-digit" });

    const [e, s] = await Promise.all([
      prisma.transaction.aggregate({
        where: { churchId: user.churchId, type: "ENTREE", date: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { churchId: user.churchId, type: "SORTIE", date: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
    ]);

    months.push({
      label,
      entrees: Number(e._sum.amount ?? 0),
      sorties: Number(s._sum.amount ?? 0),
    });
  }

  const totalEntrees = Number(totalEntreesAgg._sum.amount ?? 0);
  const totalSorties = Number(totalSortiesAgg._sum.amount ?? 0);

  return NextResponse.json({
    success: true,
    data: {
      solde: totalEntrees - totalSorties,
      totalEntrees,
      totalSorties,
      entreesThisMois: Number(entreesThisMonthAgg._sum.amount ?? 0),
      sortiesByFamily: {
        FONCTIONNEMENT: Number(sortiesFonctionnementAgg._sum.amount ?? 0),
        INVESTISSEMENT: Number(sortiesInvestissementAgg._sum.amount ?? 0),
        EXCEPTIONNEL: Number(sortiesExceptionnelAgg._sum.amount ?? 0),
      },
      evolution6mois: months,
    },
  });
}
