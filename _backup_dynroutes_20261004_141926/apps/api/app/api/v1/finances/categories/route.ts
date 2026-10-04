import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@churchflow/database";
import { z } from "zod";
import { auth, getAuthUser, unauthorized } from "../../../../../lib/auth";

const createCategorySchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100),
  flowType: z.enum(["ENTREE", "SORTIE"]),
  family: z.enum(["FONCTIONNEMENT", "INVESTISSEMENT", "EXCEPTIONNEL"]).optional().nullable(),
  color: z.string().optional().nullable(),
});

export async function GET() {
  const session = await auth();
  const user = getAuthUser(session);
  if (!user) return unauthorized();

  const categories = await prisma.financeCategory.findMany({
    where: { churchId: user.churchId, isActive: true },
    orderBy: [{ flowType: "asc" }, { family: "asc" }, { name: "asc" }],
  });

  const grouped = {
    entrees: categories.filter((c) => c.flowType === "ENTREE"),
    sorties: {
      FONCTIONNEMENT: categories.filter(
        (c) => c.flowType === "SORTIE" && c.family === "FONCTIONNEMENT"
      ),
      INVESTISSEMENT: categories.filter(
        (c) => c.flowType === "SORTIE" && c.family === "INVESTISSEMENT"
      ),
      EXCEPTIONNEL: categories.filter(
        (c) => c.flowType === "SORTIE" && c.family === "EXCEPTIONNEL"
      ),
    },
  };

  return NextResponse.json({ success: true, data: grouped });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const user = getAuthUser(session);
  if (!user) return unauthorized();

  const body = await req.json();
  const parsed = createCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { name, flowType, family, color } = parsed.data;

  if (flowType === "SORTIE" && !family) {
    return NextResponse.json(
      { success: false, error: "La famille (FONCTIONNEMENT/INVESTISSEMENT/EXCEPTIONNEL) est requise pour une sortie" },
      { status: 400 }
    );
  }

  const existing = await prisma.financeCategory.findUnique({
    where: { churchId_name_flowType: { churchId: user.churchId, name, flowType } },
  });
  if (existing) {
    return NextResponse.json(
      { success: false, error: "Une catégorie avec ce nom existe déjà pour ce type de flux" },
      { status: 409 }
    );
  }

  const category = await prisma.financeCategory.create({
    data: { name, flowType, family: family ?? null, color: color ?? null, churchId: user.churchId },
  });

  return NextResponse.json({ success: true, data: category, message: "Catégorie créée" }, { status: 201 });
}
