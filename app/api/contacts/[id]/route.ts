import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/require-auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(req);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await req.json();
    await db
      .update(contacts)
      .set({ read: body.read })
      .where(eq(contacts.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[contacts PATCH]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(req);
  if (authError) return authError;

  try {
    const { id } = await params;
    await db.delete(contacts).where(eq(contacts.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[contacts DELETE]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
