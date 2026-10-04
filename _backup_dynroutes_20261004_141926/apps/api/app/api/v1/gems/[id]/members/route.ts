import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../../lib/auth';
import { getAuthUser } from '../../../../../../lib/auth';
import { prisma } from '@churchflow/database';
import { z } from 'zod';
import { requireAuth, checkGemPermissions, requireOwnership } from '../../../../../../src/lib/rbac';

const addMemberSchema = z.object({
  memberId: z.string(),
  role: z.enum(['LEADER', 'MEMBER', 'ASSISTANT']).default('MEMBER'),
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAuth(request);
  if (!user) return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });

  // Vérifier les permissions
  const permissions = checkGemPermissions(user);
  if (!permissions.canView) {
    return NextResponse.json({ success: false, error: "Permission refusée" }, { status: 403 });
  }

  try {
    const gem = await prisma.gem.findUnique({
      where: { id: params.id }
    });

    if (!gem) {
      return NextResponse.json({ success: false, error: "GEM non trouvé" }, { status: 404 });
    }

    if (gem.churchId !== user.churchId) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    const members = await prisma.gemMember.findMany({
      where: { gemId: params.id },
      include: {
        member: { select: { id: true, firstName: true, lastName: true, status: true } }
      },
      orderBy: { isLeader: 'desc', joinedAt: 'asc' }
    });

    return NextResponse.json({ success: true, data: members });
  } catch (error) {
    console.error('Error fetching gem members:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des membres" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAuth(request);
  if (!user) return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });

  // Vérifier les permissions
  const permissions = checkGemPermissions(user);
  if (!permissions.canManageMembers) {
    return NextResponse.json({ success: false, error: "Permission refusée" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validatedData = addMemberSchema.parse(body);

    const gem = await prisma.gem.findUnique({
      where: { id: params.id }
    });

    if (!gem) {
      return NextResponse.json({ success: false, error: "GEM non trouvé" }, { status: 404 });
    }

    if (gem.churchId !== user.churchId) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    const existingMember = await prisma.gemMember.findUnique({
      where: { gemId_memberId: { gemId: params.id, memberId: validatedData.memberId } }
    });

    if (existingMember) {
      return NextResponse.json({ success: false, error: "Ce membre est déjà dans ce GEM" }, { status: 400 });
    }

    // Un membre ne peut appartenir qu'à un seul GEM
    const memberInAnyGem = await prisma.gemMember.findFirst({
      where: { memberId: validatedData.memberId },
      include: { gem: { select: { id: true, name: true } } }
    });

    if (memberInAnyGem) {
      return NextResponse.json({
        success: false,
        error: `Ce membre appartient déjà au GEM "${(memberInAnyGem as any).gem.name}". Retirez-le d'abord de son GEM actuel.`
      }, { status: 400 });
    }

    const newMember = await prisma.gemMember.create({
      data: {
        gemId: params.id,
        memberId: validatedData.memberId,
        isLeader: validatedData.role === 'LEADER'
      },
      include: {
        member: { select: { id: true, firstName: true, lastName: true, status: true } }
      }
    });

    if (validatedData.role === 'LEADER') {
      const oldLeaders = await prisma.gemMember.findMany({
        where: {
          gemId: params.id,
          id: { not: newMember.id },
          isLeader: true
        },
        include: { member: true }
      });

      await prisma.gemMember.updateMany({
        where: {
          gemId: params.id,
          id: { not: newMember.id }
        },
        data: { isLeader: false }
      });

      const gemRole = await prisma.role.findFirst({ where: { name: 'RESPONSABLE_GEM' } });
      if (gemRole) {
        for (const oldLeader of oldLeaders) {
          if (oldLeader.member.userId) {
            await prisma.userRole.deleteMany({
              where: { userId: oldLeader.member.userId, roleId: gemRole.id }
            });
          }
        }

        const newMemberFull = await prisma.member.findUnique({ where: { id: validatedData.memberId } });
        if (newMemberFull?.userId) {
          await prisma.userRole.upsert({
            where: { userId_roleId: { userId: newMemberFull.userId, roleId: gemRole.id } },
            create: { userId: newMemberFull.userId, roleId: gemRole.id },
            update: {}
          });
        }
      }
    }

    return NextResponse.json({ success: true, data: newMember }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error adding member to gem:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'ajout du membre" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  const user = getAuthUser(session);
  if (!user) return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json({ success: false, error: "ID du membre manquant" }, { status: 400 });
    }

    const gem = await prisma.gem.findUnique({
      where: { id: params.id }
    });

    if (!gem) {
      return NextResponse.json({ success: false, error: "GEM non trouvé" }, { status: 404 });
    }

    if (gem.churchId !== user.churchId) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    const gemMember = await prisma.gemMember.findUnique({
      where: { gemId_memberId: { gemId: params.id, memberId } },
      include: { member: { select: { id: true, firstName: true, lastName: true, userId: true } } }
    });

    if (!gemMember) {
      return NextResponse.json({ success: false, error: "Membre non trouvé dans ce GEM" }, { status: 404 });
    }

    if (gemMember.isLeader) {
      const newLeader = await prisma.gemMember.findFirst({
        where: {
          gemId: params.id,
          isLeader: false
        },
        include: { member: true }
      });

      const gemRole = await prisma.role.findFirst({ where: { name: 'RESPONSABLE_GEM' } });
      
      if (newLeader) {
        await prisma.gemMember.update({
          where: { id: newLeader.id },
          data: { isLeader: true }
        });

        if (gemRole && newLeader.member.userId) {
          await prisma.userRole.upsert({
            where: { userId_roleId: { userId: newLeader.member.userId, roleId: gemRole.id } },
            create: { userId: newLeader.member.userId, roleId: gemRole.id },
            update: {}
          });
        }
      }

      // Remove role from the deleted leader
      if (gemRole && gemMember.member.userId) {
        await prisma.userRole.deleteMany({
          where: { userId: gemMember.member.userId, roleId: gemRole.id }
        });
      }
    }

    await prisma.gemMember.delete({
      where: { gemId_memberId: { gemId: params.id, memberId } }
    });

    return NextResponse.json({ success: true, message: "Membre retiré avec succès", gemDeleted: false });
  } catch (error) {
    console.error('Error removing member from gem:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors du retrait du membre" },
      { status: 500 }
    );
  }
}