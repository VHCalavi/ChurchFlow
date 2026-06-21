import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';
import { getAuthUser } from '../../../../lib/auth';
import { prisma } from '@churchflow/database';
import { z } from 'zod';

const updateGemSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  const user = getAuthUser(session);
  if (!user) return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });

  try {
    const gem = await prisma.gem.findUnique({
      where: { id: params.id },
      include: {
        group: { select: { id: true, name: true } },
        members: {
          include: { member: { select: { id: true, firstName: true, lastName: true, status: true } } },
          orderBy: { isLeader: 'desc', joinedAt: 'asc' }
        },
        reports: {
          include: { author: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { submittedAt: 'desc' }
        }
      }
    });

    if (!gem) {
      return NextResponse.json({ success: false, error: "GEM non trouvé" }, { status: 404 });
    }

    if (gem.churchId !== user.churchId) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    return NextResponse.json({ success: true, data: gem });
  } catch (error) {
    console.error('Error fetching gem:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération du GEM" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  const user = getAuthUser(session);
  if (!user) return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });

  try {
    const body = await request.json();
    const validatedData = updateGemSchema.parse(body);

    const existingGem = await prisma.gem.findUnique({
      where: { id: params.id }
    });

    if (!existingGem) {
      return NextResponse.json({ success: false, error: "GEM non trouvé" }, { status: 404 });
    }

    if (existingGem.churchId !== user.churchId) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    const gem = await prisma.gem.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        group: { select: { id: true, name: true } },
        members: {
          include: { member: { select: { id: true, firstName: true, lastName: true, status: true } } }
        }
      }
    });

    return NextResponse.json({ success: true, data: gem });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating gem:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la mise à jour du GEM" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  const user = getAuthUser(session);
  if (!user) return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });

  try {
    const existingGem = await prisma.gem.findUnique({
      where: { id: params.id }
    });

    if (!existingGem) {
      return NextResponse.json({ success: false, error: "GEM non trouvé" }, { status: 404 });
    }

    if (existingGem.churchId !== user.churchId) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    await prisma.gem.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true, message: "GEM supprimé avec succès" });
  } catch (error) {
    console.error('Error deleting gem:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la suppression du GEM" },
      { status: 500 }
    );
  }
}