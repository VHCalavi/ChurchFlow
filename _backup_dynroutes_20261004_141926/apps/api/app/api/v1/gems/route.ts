import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';
import { getAuthUser } from '../../../../lib/auth';
import { prisma } from '@churchflow/database';
import { z } from 'zod';
import { requireAuth, hasPermission, checkGemPermissions } from '../../../../src/lib/rbac';

const createGemSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
  groupId: z.string().optional(),
  isActive: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  const user = await requireAuth(request);
  if (!user) return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });

  const permissions = checkGemPermissions(user);
  if (!permissions.canView) {
    return NextResponse.json({ success: false, error: "Permission refusée" }, { status: 403 });
  }

  try {
    const url = new URL(request.url);
    const groupId = url.searchParams.get('groupId') || undefined;

    const gems = await prisma.gem.findMany({
      where: {
        churchId: user.churchId,
        isActive: true,
        ...(groupId && { groupId })
      },
      include: {
        group: { select: { id: true, name: true } },
        members: {
          include: { member: { select: { id: true, firstName: true, lastName: true, status: true } } }
        },
        reports: {
          select: { id: true, title: true, type: true, submittedAt: true },
          orderBy: { submittedAt: 'desc' }
        },
        _count: { select: { members: true, reports: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: gems });
  } catch (error) {
    console.error('Error fetching gems:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des GEMs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await requireAuth(request);
  if (!user) return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });

  const permissions = checkGemPermissions(user);
  if (!permissions.canCreate) {
    return NextResponse.json({ success: false, error: "Permission refusée" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { memberIds, ...gemFields } = body;
    const validatedData = createGemSchema.parse(gemFields);

    // Vérifier quels membres sont déjà dans un GEM
    const mergedInto: { memberId: string; gemId: string; gemName: string }[] = [];
    const freshMemberIds: string[] = [];

    if (memberIds && Array.isArray(memberIds) && memberIds.length > 0) {
      await Promise.all(memberIds.map(async (memberId: string) => {
        const existing = await prisma.gemMember.findFirst({
          where: { memberId },
          include: { gem: { select: { id: true, name: true } } }
        });
        if (existing) {
          mergedInto.push({ memberId, gemId: existing.gemId, gemName: existing.gem.name });
        } else {
          freshMemberIds.push(memberId);
        }
      }));
    }

    // Si un des membres est déjà dans un GEM, on ajoute les nouveaux membres à ce GEM existant
    // Le frontend doit garantir qu'on ne mixe pas des membres de GEMs différents.
    let targetGemId: string | null = null;
    let targetGem = null;

    if (mergedInto.length > 0) {
      targetGemId = mergedInto[0].gemId;
      
      if (freshMemberIds.length > 0) {
        await prisma.gemMember.createMany({
          data: freshMemberIds.map((memberId: string) => ({
            gemId: targetGemId as string,
            memberId,
            isLeader: false,
          })),
          skipDuplicates: true,
        });
      }

      targetGem = await prisma.gem.findUnique({
        where: { id: targetGemId },
        include: {
          group: { select: { id: true, name: true } },
          members: { include: { member: { select: { id: true, firstName: true, lastName: true, status: true } } } }
        }
      });

      return NextResponse.json({
        success: true,
        data: targetGem,
        mergedMembers: mergedInto,
        isExisting: true
      }, { status: 200 });
    }

    // Sinon, on crée un nouveau GEM
    const gem = await prisma.gem.create({
      data: {
        ...validatedData,
        churchId: user.churchId
      }
    });

    if (freshMemberIds.length > 0) {
      await prisma.gemMember.createMany({
        data: freshMemberIds.map((memberId: string, idx: number) => ({
          gemId: gem.id,
          memberId,
          isLeader: idx === 0,
        })),
        skipDuplicates: true,
      });
    }

    const gemWithMembers = await prisma.gem.findUnique({
      where: { id: gem.id },
      include: {
        group: { select: { id: true, name: true } },
        members: { include: { member: { select: { id: true, firstName: true, lastName: true, status: true } } } }
      }
    });

    return NextResponse.json({
      success: true,
      data: gemWithMembers,
      mergedMembers: mergedInto,
      isExisting: false
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating gem:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la création du GEM" },
      { status: 500 }
    );
  }
}