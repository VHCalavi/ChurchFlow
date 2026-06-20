import { NextResponse } from 'next/server';
import { familyRelationService } from '../../../../../../src/services/family-relation-service';
import { prisma } from '@churchflow/database';

/**
 * Retourne la relation inverse correcte selon le type donné.
 * 
 * - Si A est PARENT de B  → B est ENFANT de A
 * - Si A est ENFANT de B  → B est PARENT de A
 * - Si A est SPOUSE de B  → B est SPOUSE de A  (symétrique)
 * - Si A est SIBLING de B → B est SIBLING de A (symétrique)
 * - Si A est GEM_PARTNER  → B est GEM_PARTNER  (symétrique)
 */
function getInverseRelationType(relationType: string): string {
  const inverseMap: Record<string, string> = {
    PARENT: 'ENFANT',
    ENFANT: 'PARENT',
    SPOUSE: 'SPOUSE',
    SIBLING: 'SIBLING',
    GEM_PARTNER: 'GEM_PARTNER',
  };
  return inverseMap[relationType] ?? relationType;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      includeFamily: searchParams.get('includeFamily') === 'true',
      includeGem: searchParams.get('includeGem') === 'true',
    };

    const relations = await familyRelationService.getByMember(params.id, filters);
    return NextResponse.json({ success: true, data: relations });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error fetching family relations' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { relativeId, relationType } = body;

    if (!relativeId || !relationType) {
      return NextResponse.json({ success: false, error: 'relativeId et relationType sont requis.' }, { status: 400 });
    }

    if (relativeId === params.id) {
      return NextResponse.json({ success: false, error: 'Un membre ne peut pas être lié à lui-même.' }, { status: 400 });
    }

    const inverseType = getInverseRelationType(relationType);

    // Créer les deux relations en une seule transaction atomique
    // afin que les deux enregistrements soient toujours cohérents
    const [directRelation] = await prisma.$transaction([
      // Relation directe : A → B (ex: A est PARENT de B)
      prisma.familyRelation.upsert({
        where: {
          memberId_relativeId_relationType: {
            memberId: params.id,
            relativeId,
            relationType,
          },
        },
        update: { isActive: true },
        create: {
          memberId: params.id,
          relativeId,
          relationType,
          isActive: true,
        },
        include: {
          relative: {
            select: { id: true, firstName: true, lastName: true, photoUrl: true },
          },
        },
      }),

      // Relation inverse : B → A (ex: B est ENFANT de A)
      prisma.familyRelation.upsert({
        where: {
          memberId_relativeId_relationType: {
            memberId: relativeId,
            relativeId: params.id,
            relationType: inverseType,
          },
        },
        update: { isActive: true },
        create: {
          memberId: relativeId,
          relativeId: params.id,
          relationType: inverseType,
          isActive: true,
        },
      }),
    ]);

    return NextResponse.json({ success: true, data: directRelation });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
