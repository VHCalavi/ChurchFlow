import { NextResponse } from 'next/server';
import { prisma } from '@churchflow/database';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const attendances = await prisma.meetingAttendee.findMany({
      where: { memberId: params.id },
      include: { meeting: true },
      orderBy: { meeting: { date: 'desc' } }
    });
    return NextResponse.json({ success: true, data: attendances });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erreur lors de la récupération des présences' }, { status: 500 });
  }
}
