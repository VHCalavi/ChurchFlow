import { NextResponse } from "next/server";
import { prisma } from "@churchflow/database";
import { z } from "zod";
import { auth, getAuthUser, unauthorized } from "../../../../lib/auth";

const createGroupSchema = z.object({
  name: z.string().min(1, "Le nom du groupe est requis"),
  description: z.string().optional().nullable(),
  type: z.enum(["DEPARTEMENT", "TRIBU", "MAISON_D_HONNEUR", "CELLULE", "ASSEMBLEE"]),
  parentId: z.string().optional().nullable(),
  churchId: z.string().optional()
});

export async function GET() {
  const session = await auth();
  const user = getAuthUser(session);
  if (!user) return unauthorized();

  try {
    const groups = await prisma.group.findMany({
      where: { churchId: user.churchId },
      include: {
        parent: {
          select: { id: true, name: true, type: true }
        },
        children: {
          select: { id: true, name: true, type: true }
        },
        _count: {
          select: { members: true }
        }
      },
      orderBy: { name: "asc" }
    });

    return NextResponse.json({ success: true, data: groups });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des groupes: " + message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();
  const user = getAuthUser(session);
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    const result = createGroupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors.map(e => e.message).join(", ") },
        { status: 400 }
      );
    }

    const { type, parentId } = result.data;



    if (parentId) {
      const parentGroup = await prisma.group.findUnique({
        where: { id: parentId }
      });

      if (!parentGroup) {
        return NextResponse.json(
          { success: false, error: "Le groupe parent spécifié n'existe pas" },
          { status: 400 }
        );
      }

      if (parentGroup.churchId !== user.churchId) {
        return NextResponse.json(
          { success: false, error: "Le groupe parent n'appartient pas à votre église" },
          { status: 403 }
        );
      }

    }

    const group = await prisma.group.create({
      data: {
        name: result.data.name,
        description: result.data.description,
        type: result.data.type,
        parentId: result.data.parentId || null,
        churchId: user.churchId
      }
    });

    return NextResponse.json({ success: true, data: group }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { success: false, error: "Erreur lors de la création du groupe: " + message },
      { status: 500 }
    );
  }
}
