import { NextResponse } from "next/server";
import { prisma } from "@churchflow/database";
import { z } from "zod";

const createFormationSchema = z.object({
  name: z.string().min(1, "Le nom de la formation est requis"),
  description: z.string().optional().nullable(),
  type: z.enum(["ACADEMIE", "BAPTEME", "PORTEURS_DE_VIE", "ECOLE_DES_BERGERS"]),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  churchId: z.string().min(1, "L'identifiant de l'église (churchId) est requis")
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const churchId = searchParams.get("churchId");
    
    if (!churchId) {
      return NextResponse.json(
        { success: false, error: "L'identifiant de l'église (churchId) est requis" },
        { status: 400 }
      );
    }

    const formations = await prisma.formation.findMany({
      where: { churchId },
      include: {
        _count: {
          select: { members: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, data: formations });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des formations: " + message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = createFormationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors.map(e => e.message).join(", ") },
        { status: 400 }
      );
    }

    const formation = await prisma.formation.create({
      data: {
        name: result.data.name,
        description: result.data.description,
        type: result.data.type,
        startDate: result.data.startDate ? new Date(result.data.startDate) : null,
        endDate: result.data.endDate ? new Date(result.data.endDate) : null,
        churchId: result.data.churchId
      }
    });

    return NextResponse.json({ success: true, data: formation }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { success: false, error: "Erreur lors de la création de la formation: " + message },
      { status: 500 }
    );
  }
}
