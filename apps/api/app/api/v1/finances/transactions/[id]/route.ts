import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@churchflow/database";
import { z } from "zod";
import { auth, getAuthUser, unauthorized } from "../../../../../../lib/auth";

const updateTransactionSchema = z.object({
  label: z.string().min(1).max(255).optional(),
  amount: z.number().positive().optional(),
  type: z.enum(["ENTREE", "SORTIE"]).optional(),
  expenseFamily: z
    .enum(["FONCTIONNEMENT", "INVESTISSEMENT", "EXCEPTIONNEL"])
    .optional()
    .nullable(),
  categoryId: z.string().optional().nullable(),
  paymentMethod: z
    .enum(["ESPECES", "MOBILE_MONEY", "CHEQUE", "VIREMENT"])
    .optional(),
  date: z.string().optional(),
  donorName: z.string().optional().nullable(),
  reference: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  const user = getAuthUser(session);
  if (!user) return unauthorized();

  const transaction = await prisma.transaction.findFirst({
    where: { id: params.id, churchId: user.churchId },
    include: { category: true },
  });

  if (!transaction) {
    return NextResponse.json({ success: false, error: "Transaction introuvable" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: transaction });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  const user = getAuthUser(session);
  if (!user) return unauthorized();

  const existing = await prisma.transaction.findFirst({
    where: { id: params.id, churchId: user.churchId },
  });
  if (!existing) {
    return NextResponse.json({ success: false, error: "Transaction introuvable" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = updateTransactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;

  if (data.categoryId) {
    const cat = await prisma.financeCategory.findFirst({
      where: { id: data.categoryId, churchId: user.churchId },
    });
    if (!cat) {
      return NextResponse.json(
        { success: false, error: "Catégorie invalide" },
        { status: 400 }
      );
    }
  }

  const updated = await prisma.transaction.update({
    where: { id: params.id },
    data: {
      ...data,
      ...(data.date ? { date: new Date(data.date) } : {}),
    },
    include: { category: true },
  });

  return NextResponse.json({ success: true, data: updated, message: "Transaction mise à jour" });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  const user = getAuthUser(session);
  if (!user) return unauthorized();

  const existing = await prisma.transaction.findFirst({
    where: { id: params.id, churchId: user.churchId },
  });
  if (!existing) {
    return NextResponse.json({ success: false, error: "Transaction introuvable" }, { status: 404 });
  }

  await prisma.transaction.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true, message: "Transaction supprimée" });
}
