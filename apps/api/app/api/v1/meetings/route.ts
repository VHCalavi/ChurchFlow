import { NextResponse } from "next/server";
import { prisma } from "@churchflow/database";
import { z } from "zod";

const createMeetingSchema = z.object({
  title: z.string().min(1, "Le titre de la réunion est requis"),
  description: z.string().optional().nullable(),
  type: z.enum(["CULTE", "TEMPS_DE_PRIERE", "REPETITION", "AGAPE", "AUTRE"]),
  date: z.string().min(1, "La date et l'heure sont requises"),
  location: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
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

    const meetings = await prisma.meeting.findMany({
      where: { churchId },
      include: {
        _count: {
          select: { attendees: true }
        }
      },
      orderBy: { date: "desc" }
    });

    return NextResponse.json({ success: true, data: meetings });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des réunions: " + message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = createMeetingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors.map(e => e.message).join(", ") },
        { status: 400 }
      );
    }

    const meeting = await prisma.meeting.create({
      data: {
        title: result.data.title,
        description: result.data.description,
        type: result.data.type,
        date: new Date(result.data.date),
        location: result.data.location,
        notes: result.data.notes,
        churchId: result.data.churchId
      }
    });

    return NextResponse.json({ success: true, data: meeting }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { success: false, error: "Erreur lors de la création de la réunion: " + message },
      { status: 500 }
    );
  }
}
