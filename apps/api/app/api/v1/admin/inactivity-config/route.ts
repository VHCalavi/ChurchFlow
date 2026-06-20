import { NextResponse } from 'next/server';
import { inactivityConfigService } from '../../../../../../src/services/inactivity-config-service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const churchId = searchParams.get('churchId') || 'default-church-id';

    const config = await inactivityConfigService.getConfig(churchId);
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error fetching inactivity config' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const churchId = body.churchId || 'default-church-id';
    
    const config = await inactivityConfigService.updateConfig(churchId, body);
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error updating inactivity config' }, { status: 500 });
  }
}
