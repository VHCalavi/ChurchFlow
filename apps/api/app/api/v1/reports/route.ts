import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';
import { getAuthUser } from '../../../../lib/auth';
import { prisma } from '@churchflow/database';
import { z } from 'zod';
import { reportService } from '../../../../src/services/report-service';
import { requireAuth, hasRole } from '../../../../src/lib/rbac';

const createReportSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  content: z.string().min(1, "Le contenu est requis"),
  type: z.enum(['ACTIVITY', 'FINANCIAL', 'SPIRITUAL', 'TRAINING', 'MEETING']).default('ACTIVITY'),
  gemId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const user = await requireAuth(request);
  if (!user) return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });

  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const gemId = url.searchParams.get('gemId');

    // Filtrer par rôle
    const userRole = user.roles.includes('ADMIN') ? 'ADMIN' :
                    user.roles.includes('RESPONSABLE_GEM') ? 'RESPONSABLE_GEM' :
                    user.roles.includes('RESPONSABLE_GROUPE') ? 'RESPONSABLE_GROUPE' :
                    'PASTEUR_RESIDENT';

    const reports = await reportService.getFiltered(user.id, user.churchId, userRole, {
      type: type as any,
      gemId: gemId as any
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
  const user = await requireAuth(request);
  if (!user) return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });

  try {
    const body = await request.json();
    const validatedData = createReportSchema.parse(body);

    // Utiliser le service pour créer le rapport
    const report = await reportService.create({
      title: validatedData.title,
      content: validatedData.content,
      authorId: user.id,
      churchId: user.churchId,
      gemId: validatedData.gemId
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