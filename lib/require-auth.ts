import { NextResponse, type NextRequest } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';

/**
 * Guards an API route handler behind a valid admin JWT cookie.
 * Returns a 401 JSON response if the caller is not authenticated.
 */
export async function requireAuth(req: NextRequest): Promise<NextResponse | null> {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
