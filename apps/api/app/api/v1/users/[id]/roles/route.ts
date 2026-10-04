import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@churchflow/database';
import { z } from 'zod';
import { requirePermission } from '../../../../../../src/lib/rbac';

const assignSchema = z.object({
  roleIds: z.array(z.string()).min(1, 'Au moins un rôle requis'),
  mode: z.enum(['replace', 'add']).default('replace'),
});

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requirePermission(request, 'manage:roles');
  if (!admin) return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 403 });

  const targetUser = await prisma.user.findUnique({ where: { id: params.id } });
  if (!targetUser || targetUser.churchId !== admin.churchId) {
    return NextResponse.json({ success: false, error: 'Utilisateur introuvable' }, { status: 404 });
  }

  const body = await request.json();
  const parsed = assignSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: 'Payload invalide' }, { status: 400 });

  const roles = await prisma.role.findMany({ where: { id: { in: parsed.data.roleIds } } });
  const invalid = roles.find(r => r.churchId && r.churchId !== admin.churchId);
  if (invalid) return NextResponse.json({ success: false, error: 'Rôle invalide pour cette église' }, { status: 403 });

  await prisma.$transaction(async tx => {
    if (parsed.data.mode === 'replace') {
      await tx.userRole.deleteMany({ where: { userId: params.id } });
    }
    for (const roleId of parsed.data.roleIds) {
      await tx.userRole.upsert({
        where: { userId_roleId: { userId: params.id, roleId } },
        create: { userId: params.id, roleId },
        update: {},
      });
    }
  });

  return NextResponse.json({ success: true, message: 'Rôles mis à jour.' });
}
