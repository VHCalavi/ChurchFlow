import { NextResponse } from "next/server";
import { prisma } from "@churchflow/database";
import { z } from "zod";
import { auth, getAuthUser, unauthorized } from "../../../../../lib/auth";

const updateMeetingSchema = z.object({
  title: z.string().min(1, "Le titre de la réunion est requis").optional(),
  description: z.string().optional().nullable(),
  type: z.enum(["CULTE", "TEMPS_DE_PRIERE", "REPETITION", "AGAPE", "AUTRE"]).optional(),
  date: z.string().optional(),
  location: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  groupIds: z.array(z.string()).optional()
});

// GET /api/v1/meetings/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const user = getAuthUser(session);
  if (!user) return unauthorized();

  try {
    const meeting = await prisma.meeting.findFirst({
      where: {
        id: params.id,
        churchId: user.churchId
      },
      include: {
        _count: {
          select: { attendees: true }
        }
      }
    });

    if (!meeting) {
      return NextResponse.json(
        { success: false, error: "Réunion non trouvée ou accès non autorisé" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...meeting,
        groupIds: (meeting.metadata as any)?.groupIds || []
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération de la réunion: " + message },
      { status: 500 }
    );
  }
}

// PUT /api/v1/meetings/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const user = getAuthUser(session);
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    const result = updateMeetingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors.map(e => e.message).join(", ") },
        { status: 400 }
      );
    }

    const meeting = await prisma.meeting.findFirst({
      where: {
        id: params.id,
        churchId: user.churchId
      }
    });

    if (!meeting) {
      return NextResponse.json(
        { success: false, error: "Réunion non trouvée ou accès non autorisé" },
        { status: 404 }
      );
    }

    const oldMetadata = (meeting.metadata as any) || {};
    const newMetadata = {
      ...oldMetadata,
      ...(result.data.groupIds !== undefined ? { groupIds: result.data.groupIds } : {})
    };

    const updated = await prisma.meeting.update({
      where: { id: params.id },
      data: {
        title: result.data.title,
        description: result.data.description,
        type: result.data.type,
        date: result.data.date ? new Date(result.data.date) : undefined,
        location: result.data.location,
        notes: result.data.notes,
        tags: result.data.tags,
        metadata: newMetadata
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        groupIds: (updated.metadata as any)?.groupIds || []
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { success: false, error: "Erreur lors de la mise à jour de la réunion: " + message },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/meetings/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const user = getAuthUser(session);
  if (!user) return unauthorized();

  try {
    const meeting = await prisma.meeting.findFirst({
      where: {
        id: params.id,
        churchId: user.churchId
      }
    });

    if (!meeting) {
      return NextResponse.json(
        { success: false, error: "Réunion non trouvée ou accès non autorisé" },
        { status: 404 }
      );
    }

    // Cascade deletion of MeetingAttendee relations is handled by Prisma onDelete: Cascade in schema.prisma!
    await prisma.meeting.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true, message: "Réunion supprimée avec succès" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { success: false, error: "Erreur lors de la suppression de la réunion: " + message },
      { status: 500 }
    );
  }
}
