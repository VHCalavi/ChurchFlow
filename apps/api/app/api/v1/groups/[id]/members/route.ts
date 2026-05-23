import { NextResponse } from "next/server";
import { prisma } from "@churchflow/database";
import { z } from "zod";

const addMemberSchema = z.object({
  memberId: z.string().min(1, "L'identifiant du membre est requis"),
  role: z.string().optional().nullable() // e.g. "Berger", "Co-Berger", "Chantre", "Membre"
});

// POST /api/v1/groups/[id]/members - Add/link a member to a group
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = params.id;
    const body = await request.json();
    const result = addMemberSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors.map(e => e.message).join(", ") },
        { status: 400 }
      );
    }

    const { memberId, role } = result.data;

    // Verify group exists
    const group = await prisma.group.findUnique({
      where: { id: groupId }
    });

    if (!group) {
      return NextResponse.json(
        { success: false, error: "Groupe non trouvé" },
        { status: 404 }
      );
    }

    // Verify member exists
    const member = await prisma.member.findUnique({
      where: { id: memberId }
    });

    if (!member) {
      return NextResponse.json(
        { success: false, error: "Membre non trouvé" },
        { status: 404 }
      );
    }

    // Link member to group (upsert/create)
    const memberGroup = await prisma.memberGroup.upsert({
      where: {
        memberId_groupId: {
          memberId,
          groupId
        }
      },
      update: {
        role: role || "Membre"
      },
      create: {
        memberId,
        groupId,
        role: role || "Membre"
      },
      include: {
        member: {
          select: { id: true, firstName: true, lastName: true, status: true }
        }
      }
    });

    return NextResponse.json({ success: true, data: memberGroup }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { success: false, error: "Erreur lors du rattachement du membre au groupe: " + message },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/groups/[id]/members?memberId=xxx - Remove/unlink a member from a group
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = params.id;
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId");

    if (!memberId) {
      return NextResponse.json(
        { success: false, error: "L'identifiant du membre (memberId) est requis" },
        { status: 400 }
      );
    }

    // Delete relation
    await prisma.memberGroup.delete({
      where: {
        memberId_groupId: {
          memberId,
          groupId
        }
      }
    });

    return NextResponse.json({ success: true, message: "Membre dissocié du groupe avec succès" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { success: false, error: "Erreur lors de la dissociation du membre du groupe: " + message },
      { status: 500 }
    );
  }
}
