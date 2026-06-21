import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';
import { getAuthUser } from '../../../../lib/auth';
import { prisma } from '@churchflow/database';
import { z } from 'zod';

const createGemSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
  groupId: z.string().optional(),
  isActive: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  const session = await auth();
  const user = getAuthUser(session);
  if (!user) return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });

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
  const session = await auth();
  const user = getAuthUser(session);
  if (!user) return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });

  try {
    const body = await request.json();
    const validatedData = createGemSchema.parse(body);

    const gem = await prisma.gem.create({
      data: {
        ...validatedData,
        churchId: user.churchId
      },
      include: {
        group: { select: { id: true, name: true } },
        members: { include: { member: { select: { id: true, firstName: true, lastName: true, status: true } } } }
      }
    });

    return NextResponse.json({ success: true, data: gem }, { status: 201 });
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