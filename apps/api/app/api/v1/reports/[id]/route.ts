import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';
import { getAuthUser } from '../../../../lib/auth';
import { prisma } from '@churchflow/database';
import { z } from 'zod';

const updateReportSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  type: z.enum(['ACTIVITY', 'FINANCIAL', 'SPIRITUAL', 'TRAINING', 'MEETING']).optional(),
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  const user = getAuthUser(session);
  if (!user) return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });

  try {
    const report = await prisma.report.findUnique({
      where: { id: params.id },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, status: true } },
        gem: { select: { id: true, name: true } }
      }
    });

    if (!report) {
      return NextResponse.json({ success: false, error: "Rapport non trouvé" }, { status: 404 });
    }

    if (report.churchId !== user.churchId) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    return NextResponse.json({ success: true, data: report });
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération du rapport" },
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
    const validatedData = updateReportSchema.parse(body);

    const existingReport = await prisma.report.findUnique({
      where: { id: params.id }
    });

    if (!existingReport) {
      return NextResponse.json({ success: false, error: "Rapport non trouvé" }, { status: 404 });
    }

    if (existingReport.churchId !== user.churchId) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    const report = await prisma.report.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
        gem: { select: { id: true, name: true } }
      }
    });

    return NextResponse.json({ success: true, data: report });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating report:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la mise à jour du rapport" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  const user = getAuthUser(session);
  if (!user) return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });

  try {
    const existingReport = await prisma.report.findUnique({
      where: { id: params.id }
    });

    if (!existingReport) {
      return NextResponse.json({ success: false, error: "Rapport non trouvé" }, { status: 404 });
    }

    if (existingReport.churchId !== user.churchId) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    await prisma.report.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true, message: "Rapport supprimé avec succès" });
  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la suppression du rapport" },
      { status: 500 }
    );
  }
}