import { NextResponse } from 'next/server';
import { desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { consultationRequests } from '@/lib/schema';

export async function GET() {
  try {
    const rows = await db.select().from(consultationRequests).orderBy(desc(consultationRequests.createdAt));
    return NextResponse.json(rows);
  } catch (err) {
    console.error('[consultations GET]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
