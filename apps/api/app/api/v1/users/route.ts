import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@churchflow/database';
import { requirePermission } from '../../../../src/lib/rbac';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await requirePermission(request, 'manage:roles');
  if (!user) {
    return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: { churchId: user.churchId },
    select: {
      id: true,
      email: true,
      name: true,
      isActive: true,
      avatarUrl: true,
      roles: {
        select: {
          role: { select: { id: true, name: true, description: true } },
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({ success: true, data: users });
}
