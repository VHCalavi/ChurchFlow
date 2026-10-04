import { NextResponse } from 'next/server';
import { prisma } from '@churchflow/database';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const memberGroups = await prisma.memberGroup.findMany({
      where: { memberId: params.id },
      include: { group: true }
    });
    return NextResponse.json({ success: true, data: memberGroups });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erreur lors de la récupération des groupes' }, { status: 500 });
  }
}
