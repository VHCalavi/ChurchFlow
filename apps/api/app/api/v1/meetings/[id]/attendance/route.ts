import { NextResponse } from "next/server";
import { prisma } from "@churchflow/database";
import { z } from "zod";

const bulkAttendanceSchema = z.object({
  // Array of { memberId, isPresent, notes? }
  attendees: z.array(
    z.object({
      memberId: z.string().min(1),
      isPresent: z.boolean(),
      notes: z.string().optional().nullable()
    })
  ).min(1, "Au moins un enregistrement de présence est requis")
});

// GET /api/v1/meetings/[id]/attendance
// Returns the attendance sheet for a meeting with all members of the church
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id: params.id },
      include: {
        attendees: {
          include: {
            member: {
              select: { id: true, firstName: true, lastName: true, status: true, grade: true, isActive: true }
            }
          }
        }
      }
    });

    if (!meeting) {
      return NextResponse.json(
        { success: false, error: "Réunion non trouvée" },
        { status: 404 }
      );
    }

    // Fetch all active members of the church to show full list
    const allMembers = await prisma.member.findMany({
      where: { churchId: meeting.churchId, isActive: true },
      select: { id: true, firstName: true, lastName: true, status: true, grade: true },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }]
    });

    // Build a map of already-registered attendees for this meeting
    const attendanceMap = new Map(
      meeting.attendees.map(a => [a.memberId, { isPresent: a.isPresent, notes: a.notes }])
    );

    // Merge: for each member, add attendance status if recorded, else null
    const sheet = allMembers.map(member => ({
      ...member,
      isPresent: attendanceMap.has(member.id) ? attendanceMap.get(member.id)!.isPresent : null,
      notes: attendanceMap.get(member.id)?.notes ?? null
    }));

    const presentCount = meeting.attendees.filter(a => a.isPresent).length;
    const totalRecorded = meeting.attendees.length;

    return NextResponse.json({
      success: true,
      data: {
        meeting: {
          id: meeting.id,
          title: meeting.title,
          date: meeting.date,
          type: meeting.type,
          location: meeting.location
        },
        sheet,
        stats: {
          totalMembers: allMembers.length,
          totalRecorded,
          presentCount,
          attendanceRate: totalRecorded > 0
            ? Math.round((presentCount / totalRecorded) * 100)
            : 0
        }
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération de l'émargement: " + message },
      { status: 500 }
    );
  }
}

// POST /api/v1/meetings/[id]/attendance
// Bulk upsert attendance records for a meeting
export async function POST(
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

    const body = await request.json();
    const result = bulkAttendanceSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors.map(e => e.message).join(", ") },
        { status: 400 }
      );
    }

    // Bulk upsert using Prisma transactions
    const ops = result.data.attendees.map(({ memberId, isPresent, notes }) =>
      prisma.meetingAttendee.upsert({
        where: {
          meetingId_memberId: {
            meetingId: params.id,
            memberId
          }
        },
        update: { isPresent, notes },
        create: { meetingId: params.id, memberId, isPresent, notes }
      })
    );

    await prisma.$transaction(ops);

    return NextResponse.json({
      success: true,
      message: `${result.data.attendees.length} présence(s) enregistrée(s) avec succès`
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'enregistrement des présences: " + message },
      { status: 500 }
    );
  }
}
