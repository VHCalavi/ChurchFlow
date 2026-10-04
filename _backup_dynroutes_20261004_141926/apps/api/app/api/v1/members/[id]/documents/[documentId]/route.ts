import { NextResponse } from 'next/server';
import { prisma } from '@churchflow/database';

// GET single document
export async function GET(
  request: Request,
  { params }: { params: { id: string; documentId: string } }
) {
  try {
    const doc = await prisma.memberDocument.findUnique({ where: { id: params.documentId } });
    if (!doc || doc.memberId !== params.id) {
      return NextResponse.json({ success: false, error: 'Document introuvable' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: doc });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erreur interne' }, { status: 500 });
  }
}

// PUT update document
export async function PUT(
  request: Request,
  { params }: { params: { id: string; documentId: string } }
) {
  try {
    const { fileName, content } = await request.json();
    const doc = await prisma.memberDocument.update({
      where: { id: params.documentId },
      data: {
        ...(fileName && { fileName }),
        ...(content !== undefined && { fileUrl: content }),
      },
    });
    return NextResponse.json({ success: true, data: doc });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erreur lors de la modification' }, { status: 500 });
  }
}

// DELETE document
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; documentId: string } }
) {
  try {
    await prisma.memberDocument.delete({ where: { id: params.documentId } });
    return NextResponse.json({ success: true, message: 'Document supprimé' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
