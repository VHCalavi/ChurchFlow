import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@churchflow/database";
import { z } from "zod";
import { auth, getAuthUser, unauthorized } from "../../../../../../lib/auth";

const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  const user = getAuthUser(session);
  if (!user) return unauthorized();

  const category = await prisma.financeCategory.findFirst({
    where: { id: params.id, churchId: user.churchId },
  });
  if (!category) {
    return NextResponse.json({ success: false, error: "Catégorie introuvable" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = updateCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const updated = await prisma.financeCategory.update({
    where: { id: params.id },
    data: parsed.data,
  });

  return NextResponse.json({ success: true, data: updated, message: "Catégorie mise à jour" });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  const user = getAuthUser(session);
  if (!user) return unauthorized();

  const category = await prisma.financeCategory.findFirst({
    where: { id: params.id, churchId: user.churchId },
  });
  if (!category) {
    return NextResponse.json({ success: false, error: "Catégorie introuvable" }, { status: 404 });
  }

  if (category.isDefault) {
    return NextResponse.json(
      { success: false, error: "Les catégories par défaut ne peuvent pas être supprimées" },
      { status: 403 }
    );
  }

  await prisma.financeCategory.update({
    where: { id: params.id },
    data: { isActive: false },
  });

  return NextResponse.json({ success: true, message: "Catégorie désactivée" });
}
