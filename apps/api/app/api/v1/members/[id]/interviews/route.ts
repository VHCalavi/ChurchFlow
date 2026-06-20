import { NextResponse } from 'next/server';
import { interviewService } from '../../../../../../src/services/interview-service';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const interviews = await interviewService.getByMember(params.id);
    return NextResponse.json({ success: true, data: interviews });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error fetching interviews' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { title, content, interviewerId, type, attachments } = body;

    const interview = await interviewService.create({
      memberId: params.id,
      title,
      content,
      interviewerId,
      type,
      attachments: attachments || []
    });

    return NextResponse.json({ success: true, data: interview });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error creating interview' }, { status: 500 });
  }
}
