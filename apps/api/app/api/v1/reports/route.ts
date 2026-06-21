import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';
import { getAuthUser } from '../../../../lib/auth';
import { prisma } from '@churchflow/database';
import { z } from 'zod';

const createReportSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  content: z.string().min(1, "Le contenu est requis"),
  type: z.enum(['ACTIVITY', 'FINANCIAL', 'SPIRITUAL', 'TRAINING', 'MEETING']).default('ACTIVITY'),
  gemId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const session = await auth();
  const user = getAuthUser(session);
  if (!user) return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });

  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const gemId = url.searchParams.get('gemId');

    const whereClause: any = {
      churchId: user.churchId
    };

    if (type) whereClause.type = type;
    if (gemId) whereClause.gemId = gemId;

    const reports = await prisma.report.findMany({
      where: whereClause,
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
        gem: { select: { id: true, name: true } }
      },
      orderBy: { submittedAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des rapports" },
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
    const validatedData = createReportSchema.parse(body);

    // Trouver le membre associé à l'utilisateur
    let member = await prisma.member.findFirst({
      where: { userId: user.id }
    });

    // Si aucun membre n'est trouvé, créer un membre par défaut pour l'utilisateur
    if (!member) {
      member = await prisma.member.create({
        data: {
          firstName: user.firstName || user.name?.split(' ')[0] || 'Utilisateur',
          lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || 'Inconnu',
          userId: user.id,
          churchId: user.churchId,
          status: 'MEMBRE', // Valeur de l'enum MemberStatus
          gender: 'HOMME' // Valeur de l'enum Gender
        }
      });
    }

    const report = await prisma.report.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        type: validatedData.type,
        submittedAt: new Date(),
        author: {
          connect: { id: member.id }
        },
        ...(validatedData.gemId && {
          gem: {
            connect: { id: validatedData.gemId }
          }
        }),
        church: {
          connect: { id: user.churchId }
        }
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
        gem: { select: { id: true, name: true } }
      }
    });

    return NextResponse.json({ success: true, data: report }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating report:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la création du rapport", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}