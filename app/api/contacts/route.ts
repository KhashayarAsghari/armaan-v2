import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts } from '@/lib/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
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
