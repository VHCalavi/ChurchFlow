import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@churchflow/database';
import { z } from 'zod';
import { requireAuth, requirePermission } from '../../../../src/lib/rbac';
import { forbidden } from '../../../../lib/auth';

export const dynamic = "force-dynamic";

const createRoleSchema = z.object({
  name: z.string().min(2).max(50).regex(/^[A-Z0-9_]+$/, 'MAJUSCULES_ET_UNDERSCORES uniquement'),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).default([]),
  isDefault: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  // Lecture : accessible à tout utilisateur authentifié (peuple les dropdowns)
  const user = await requireAuth(request);
  if (!user) return forbidden();

  const roles = await prisma.role.findMany({
    where: { OR: [{ churchId: user.churchId }, { churchId: null }] },
    include: {
      permissions: { include: { permission: true } },
      _count: { select: { users: true } },
    },
    orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
  });

  return NextResponse.json({ success: true, data: roles });
}

export async function POST(request: NextRequest) {
  const user = await requirePermission(request, 'manage:roles');
  if (!user) return forbidden();

  const body = await request.json();
  const parsed = createRoleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.errors.map(e => e.message).join(', ') },
      { status: 400 }
    );
  }

  const existing = await prisma.role.findFirst({
    where: { name: parsed.data.name, OR: [{ churchId: user.churchId }, { churchId: null }] },
  });
  if (existing) {
    return NextResponse.json(
      { success: false, error: `Un rôle nommé "${parsed.data.name}" existe déjà.` },
      { status: 409 }
    );
  }

  const role = await prisma.role.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      churchId: user.churchId,
      isSystem: false,
      isDefault: parsed.data.isDefault,
      permissions: {
        create: parsed.data.permissionIds.map(pid => ({ permissionId: pid })),
      },
    },
    include: { permissions: { include: { permission: true } } },
  });

  return NextResponse.json({ success: true, data: role }, { status: 201 });
}
