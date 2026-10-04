import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@churchflow/database';
import { z } from 'zod';
import { requirePermission } from '../../../../../src/lib/rbac';

const updateRoleSchema = z.object({
  description: z.string().optional(),
  permissionIds: z.array(z.string()).optional(),
  isDefault: z.boolean().optional(),
});

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requirePermission(request, 'manage:roles');
  if (!user) return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 403 });

  const role = await prisma.role.findUnique({ where: { id: params.id } });
  if (!role) return NextResponse.json({ success: false, error: 'Rôle introuvable' }, { status: 404 });
  if (role.isSystem) return NextResponse.json({ success: false, error: 'Les rôles système ne peuvent pas être modifiés.' }, { status: 403 });
  if (role.churchId && role.churchId !== user.churchId) {
    return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = updateRoleSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: 'Payload invalide' }, { status: 400 });

  const updated = await prisma.$transaction(async tx => {
    if (parsed.data.permissionIds) {
      await tx.rolePermission.deleteMany({ where: { roleId: params.id } });
      if (parsed.data.permissionIds.length) {
        await tx.rolePermission.createMany({
          data: parsed.data.permissionIds.map(pid => ({ roleId: params.id, permissionId: pid })),
          skipDuplicates: true,
        });
      }
    }
    return tx.role.update({
      where: { id: params.id },
      data: { description: parsed.data.description, isDefault: parsed.data.isDefault },
      include: { permissions: { include: { permission: true } } },
    });
  });

  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requirePermission(request, 'manage:roles');
  if (!user) return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 403 });

  const role = await prisma.role.findUnique({
    where: { id: params.id },
    include: { _count: { select: { users: true } } },
  });
  if (!role) return NextResponse.json({ success: false, error: 'Rôle introuvable' }, { status: 404 });
  if (role.isSystem) return NextResponse.json({ success: false, error: 'Impossible de supprimer un rôle système.' }, { status: 403 });
  if (role.churchId && role.churchId !== user.churchId) {
    return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 403 });
  }
  if (role._count.users > 0) {
    return NextResponse.json(
      { success: false, error: `Ce rôle est assigné à ${role._count.users} utilisateur(s).` },
      { status: 409 }
    );
  }

  await prisma.role.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true, message: 'Rôle supprimé.' });
}
