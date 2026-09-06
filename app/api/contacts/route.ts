import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts } from '@/lib/schema';
import { desc } from 'drizzle-orm';
import { requireAuth } from '@/lib/require-auth';

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;

  try {
    const rows = await db
      .select()
      .from(contacts)
      .orderBy(desc(contacts.createdAt));
    return NextResponse.json(rows);
  } catch (err) {
    console.error('[contacts GET]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
