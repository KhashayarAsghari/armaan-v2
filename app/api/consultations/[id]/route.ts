import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { consultationRequests } from '@/lib/schema';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    await db
      .update(consultationRequests)
      .set({ read: Boolean(body.read) })
      .where(eq(consultationRequests.id, Number(id)));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[consultations PATCH]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(consultationRequests).where(eq(consultationRequests.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[consultations DELETE]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
