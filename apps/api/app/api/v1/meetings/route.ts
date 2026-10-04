import { NextResponse } from "next/server";
import { prisma } from "@churchflow/database";
import { z } from "zod";
import { auth, getAuthUser, unauthorized } from "../../../../lib/auth";
import { getManagedGroupIds } from "../../../../src/lib/group-permissions";

export const dynamic = "force-dynamic";

const createMeetingSchema = z.object({
  title: z.string().min(1, "Le titre de la réunion est requis"),
  description: z.string().optional().nullable(),
  type: z.enum(["CULTE", "TEMPS_DE_PRIERE", "REPETITION", "AGAPE", "AUTRE"]),
  date: z.string().min(1, "La date et l'heure sont requises"),
  location: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  churchId: z.string().optional(),
  groupIds: z.array(z.string()).optional()
});

export async function GET(request: Request) {
  const session = await auth();
  const user = getAuthUser(session);
  if (!user) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const requestedGroupId = searchParams.get("groupId");
    const managedGroupIds = await getManagedGroupIds(user);

    const targetGroupIds = requestedGroupId
      ? (managedGroupIds !== null ? (managedGroupIds.includes(requestedGroupId) ? [requestedGroupId] : []) : [requestedGroupId])
      : managedGroupIds;

    const rawMeetings = await prisma.meeting.findMany({
      where: { churchId: user.churchId },
      include: {
        _count: {
          select: { attendees: true }
        },
        attendees: {
          select: {
            memberId: true,
            isPresent: true,
            member: {
              select: {
                groups: {
                  select: { groupId: true }
                }
              }
            }
          }
        }
      },
      orderBy: { date: "desc" }
    });

    let filteredMeetings = rawMeetings;
    if (targetGroupIds !== null) {
      if (targetGroupIds.length === 0) {
        return NextResponse.json({ success: true, data: [] });
      }
      filteredMeetings = rawMeetings.filter(m => {
        const mGroupIds = (m.metadata as { groupIds?: string[] })?.groupIds || [];
        if (mGroupIds.length > 0) {
          return mGroupIds.some(gid => targetGroupIds.includes(gid));
        }
        return true;
      });
    }

    // Shape the response: add presentCount and filter attendees for target group
    const meetings = filteredMeetings.map(m => {
      const mGroupIds = (m.metadata as { groupIds?: string[] })?.groupIds || [];
      const relevantAttendees = targetGroupIds !== null
        ? m.attendees.filter(a => a.member.groups.some(g => targetGroupIds.includes(g.groupId)))
        : m.attendees;

      return {
        id: m.id,
        title: m.title,
        description: m.description,
        type: m.type,
        date: m.date,
        endDate: m.endDate,
        location: m.location,
        notes: m.notes,
        isRecurrent: m.isRecurrent,
        tags: m.tags,
        churchId: m.churchId,
        _count: { attendees: relevantAttendees.length },
        presentCount: relevantAttendees.filter(a => a.isPresent).length,
        attendees: relevantAttendees,
        groupIds: mGroupIds,
      };
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
  const session = await auth();
  const user = getAuthUser(session);
  if (!user) return unauthorized();

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
        tags: result.data.tags || [],
        churchId: user.churchId,
        metadata: { groupIds: result.data.groupIds || [] }
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
