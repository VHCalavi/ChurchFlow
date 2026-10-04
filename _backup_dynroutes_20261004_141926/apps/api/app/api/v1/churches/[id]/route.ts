import { NextResponse } from "next/server";
import { prisma } from "@churchflow/database";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const church = await prisma.church.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            members: true,
            groups: true,
            meetings: true,
            formations: true,
            materials: true,
            providers: true,
            purchases: true,
            transactions: true
          }
        }
      }
    });

    if (!church) {
      return NextResponse.json(
        { success: false, error: "Église non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: church });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération de l'église: " + message },
      { status: 500 }
    );
  }
}
