import { NextResponse } from "next/server";
import { prisma } from "@churchflow/database";
import { z } from "zod";
import { auth, getAuthUser, unauthorized, forbidden } from "../../../../../lib/auth";

const updateGroupSchema = z.object({
  name: z.string().min(1, "Le nom du groupe est requis").optional(),
  description: z.string().optional().nullable(),
  type: z.enum(["DEPARTEMENT", "TRIBU", "MAISON_D_HONNEUR", "CELLULE", "ASSEMBLEE"]).optional(),
  parentId: z.string().optional().nullable(),
  isActive: z.boolean().optional()
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const user = getAuthUser(session);
  if (!user) return unauthorized();

  try {
    const group = await prisma.group.findUnique({
      where: { id: params.id },
      include: {
        parent: {
          select: { id: true, name: true, type: true }
        },
        children: {
          select: { id: true, name: true, type: true }
        },
        members: {
          include: {
            member: {
              select: { id: true, firstName: true, lastName: true, status: true }
            }
          }
        }
      }
    });

    if (!group) {
      return NextResponse.json(
        { success: false, error: "Groupe non trouvé" },
        { status: 404 }
      );
    }

    if (group.churchId !== user.churchId) {
      return forbidden();
    }

    return NextResponse.json({ success: true, data: group });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération du groupe: " + message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const user = getAuthUser(session);
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    const result = updateGroupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors.map(e => e.message).join(", ") },
        { status: 400 }
      );
    }

    const currentGroup = await prisma.group.findUnique({
      where: { id: params.id }
    });

    if (!currentGroup) {
      return NextResponse.json(
        { success: false, error: "Groupe non trouvé" },
        { status: 404 }
      );
    }

    if (currentGroup.churchId !== user.churchId) {
      return forbidden();
    }

    const type = result.data.type ?? currentGroup.type;
    const parentId = result.data.parentId !== undefined ? result.data.parentId : currentGroup.parentId;



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
        return forbidden();
      }

    }

    const updatedGroup = await prisma.group.update({
      where: { id: params.id },
      data: {
        name: result.data.name,
        description: result.data.description,
        type: result.data.type,
        parentId: parentId,
        isActive: result.data.isActive
      }
    });

    return NextResponse.json({ success: true, data: updatedGroup });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { success: false, error: "Erreur lors de la mise à jour du groupe: " + message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const user = getAuthUser(session);
  if (!user) return unauthorized();

  try {
    const group = await prisma.group.findUnique({
      where: { id: params.id }
    });

    if (!group) {
      return NextResponse.json(
        { success: false, error: "Groupe non trouvé" },
        { status: 404 }
      );
    }

    if (group.churchId !== user.churchId) {
      return forbidden();
    }

    // Avant de supprimer, nous devons vérifier s'il a des sous-groupes (children)
    const hasChildren = await prisma.group.count({
      where: { parentId: params.id }
    });

    if (hasChildren > 0) {
      return NextResponse.json(
        { success: false, error: "Impossible de supprimer ce groupe car il possède des sous-groupes rattachés" },
        { status: 400 }
      );
    }

    await prisma.group.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true, message: "Groupe supprimé avec succès" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { success: false, error: "Erreur lors de la suppression du groupe: " + message },
      { status: 500 }
    );
  }
}
