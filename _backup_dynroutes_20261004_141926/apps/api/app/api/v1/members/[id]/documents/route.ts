import { NextResponse } from 'next/server';
import { documentService } from '../../../../../../src/services/document-service';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const documents = await documentService.getByMember(params.id);
    return NextResponse.json({ success: true, data: documents });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error fetching documents' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { type, fileName, content, uploadedBy } = body;

    const document = await documentService.create({
      memberId: params.id,
      type,
      fileUrl: content || "", // storing text content as requested
      fileName,
      uploadedBy: uploadedBy || "Admin"
    });

    return NextResponse.json({ success: true, data: document });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error creating document' }, { status: 500 });
  }
}
