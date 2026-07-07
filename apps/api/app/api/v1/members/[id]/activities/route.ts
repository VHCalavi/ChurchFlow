import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@churchflow/database';
import { requireAuth } from '../../../../../../src/lib/rbac';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAuth(request);
  if (!user) return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });

  try {
    const activities = await prisma.memberActivityTimeline.findMany({
      where: { memberId: params.id },
      orderBy: { date: 'desc' }
    });

    return NextResponse.json({ success: true, data: activities });
  } catch (error) {
    console.error('Error fetching member activities:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des activités" },
      { status: 500 }
    );
  }
}
