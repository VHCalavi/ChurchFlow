import { NextResponse } from "next/server";
import { prisma } from "@churchflow/database";
import { z } from "zod";

const updateMeetingSchema = z.object({
  title: z.string().min(1, "Le titre de la réunion est requis").optional(),
  description: z.string().optional().nullable(),
  type: z.enum(["CULTE", "TEMPS_DE_PRIERE", "REPETITION", "AGAPE", "AUTRE"]).optional(),
  date: z.string().optional(),
  location: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
});

// GET /api/v1/meetings/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { attendees: true }
        }
      }
    });

    if (!meeting) {
      return NextResponse.json(
        { success: false, error: "Réunion non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: meeting });
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
  try {
    const body = await request.json();
    const result = updateMeetingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors.map(e => e.message).join(", ") },
        { status: 400 }
      );
    }

    const meeting = await prisma.meeting.findUnique({
      where: { id: params.id }
    });

    if (!meeting) {
      return NextResponse.json(
        { success: false, error: "Réunion non trouvée" },
        { status: 404 }
      );
    }

    const updated = await prisma.meeting.update({
      where: { id: params.id },
      data: {
        title: result.data.title,
        description: result.data.description,
        type: result.data.type,
        date: result.data.date ? new Date(result.data.date) : undefined,
        location: result.data.location,
        notes: result.data.notes
      }
    });

    return NextResponse.json({ success: true, data: updated });
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
  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id: params.id }
    });

    if (!meeting) {
      return NextResponse.json(
        { success: false, error: "Réunion non trouvée" },
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
