import { NextResponse } from 'next/server';
import { prisma } from '@churchflow/database';

// GET single interview detail
export async function GET(
  request: Request,
  { params }: { params: { id: string; interviewId: string } }
) {
  try {
    const interview = await prisma.memberInterview.findUnique({
      where: { id: params.interviewId },
      include: {
        interviewer: { select: { id: true, firstName: true, lastName: true, photoUrl: true } },
      },
    });
    if (!interview || interview.memberId !== params.id) {
      return NextResponse.json({ success: false, error: 'Entretien introuvable' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: interview });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erreur interne' }, { status: 500 });
  }
}

// PUT update interview
export async function PUT(
  request: Request,
  { params }: { params: { id: string; interviewId: string } }
) {
  try {
    const body = await request.json();
    const { title, type, content, date, interviewerId } = body;

    const interview = await prisma.memberInterview.update({
      where: { id: params.interviewId },
      data: {
        ...(title && { title }),
        ...(type && { type }),
        ...(content !== undefined && { content }),
        ...(date && { date: new Date(date) }),
        ...(interviewerId && { interviewerId }),
      },
      include: {
        interviewer: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    return NextResponse.json({ success: true, data: interview });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erreur lors de la modification' }, { status: 500 });
  }
}

// DELETE interview
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; interviewId: string } }
) {
  try {
    await prisma.memberInterview.delete({ where: { id: params.interviewId } });
    return NextResponse.json({ success: true, message: 'Entretien supprimé' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
