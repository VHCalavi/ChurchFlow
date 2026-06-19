import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@churchflow/database";
import { z } from "zod";
import { auth, getAuthUser, unauthorized } from "../../../../../lib/auth";

const createTransactionSchema = z.object({
  label: z.string().min(1, "Le libellé est requis").max(255),
  amount: z.number().positive("Le montant doit être positif"),
  type: z.enum(["ENTREE", "SORTIE"]),
  expenseFamily: z
    .enum(["FONCTIONNEMENT", "INVESTISSEMENT", "EXCEPTIONNEL"])
    .optional()
    .nullable(),
  categoryId: z.string().optional().nullable(),
  paymentMethod: z
    .enum(["ESPECES", "MOBILE_MONEY", "CHEQUE", "VIREMENT"])
    .default("ESPECES"),
  date: z.string().min(1, "La date est requise"),
  donorName: z.string().optional().nullable(),
  reference: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  const user = getAuthUser(session);
  if (!user) return unauthorized();

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") as "ENTREE" | "SORTIE" | null;
  const expenseFamily = searchParams.get("expenseFamily") as
    | "FONCTIONNEMENT"
    | "INVESTISSEMENT"
    | "EXCEPTIONNEL"
    | null;
  const categoryId = searchParams.get("categoryId");
  const paymentMethod = searchParams.get("paymentMethod") as
    | "ESPECES"
    | "MOBILE_MONEY"
    | "CHEQUE"
    | "VIREMENT"
    | null;
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const search = searchParams.get("search");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "50"));
  const skip = (page - 1) * limit;

  const where = {
    churchId: user.churchId,
    ...(type ? { type } : {}),
    ...(expenseFamily ? { expenseFamily } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(paymentMethod ? { paymentMethod } : {}),
    ...(search
      ? {
          OR: [
            { label: { contains: search, mode: "insensitive" as const } },
            { donorName: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(from || to
      ? {
          date: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to + "T23:59:59.999Z") } : {}),
          },
        }
      : {}),
  };

  const [transactions, total, entreeAgg, sortieAgg] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { date: "desc" },
      skip,
      take: limit,
    }),
    prisma.transaction.count({ where }),
    prisma.transaction.aggregate({
      where: { churchId: user.churchId, type: "ENTREE" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { churchId: user.churchId, type: "SORTIE" },
      _sum: { amount: true },
    }),
  ]);

  const totalEntrees = Number(entreeAgg._sum.amount ?? 0);
  const totalSorties = Number(sortieAgg._sum.amount ?? 0);

  return NextResponse.json({
    success: true,
    data: transactions,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalEntrees,
      totalSorties,
      solde: totalEntrees - totalSorties,
    },
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const user = getAuthUser(session);
  if (!user) return unauthorized();

  const body = await req.json();
  const parsed = createTransactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;

  if (data.type === "SORTIE" && !data.expenseFamily) {
    return NextResponse.json(
      { success: false, error: "La famille de dépense est requise pour une sortie" },
      { status: 400 }
    );
  }

  if (data.categoryId) {
    const cat = await prisma.financeCategory.findFirst({
      where: { id: data.categoryId, churchId: user.churchId },
    });
    if (!cat) {
      return NextResponse.json(
        { success: false, error: "Catégorie invalide ou n'appartient pas à cette église" },
        { status: 400 }
      );
    }
  }

  const transaction = await prisma.transaction.create({
    data: {
      label: data.label,
      amount: data.amount,
      type: data.type,
      expenseFamily: data.expenseFamily ?? null,
      categoryId: data.categoryId ?? null,
      paymentMethod: data.paymentMethod,
      date: new Date(data.date),
      donorName: data.donorName ?? null,
      reference: data.reference ?? null,
      notes: data.notes ?? null,
      churchId: user.churchId,
    },
    include: { category: true },
  });

  return NextResponse.json(
    { success: true, data: transaction, message: "Transaction enregistrée" },
    { status: 201 }
  );
}
