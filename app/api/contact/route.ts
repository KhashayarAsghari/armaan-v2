import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts } from '@/lib/schema';
import { z } from 'zod';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const schema = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email().max(255),
  phone: z.string().max(50).optional(),
  message: z.string().min(10),
});

export async function POST(req: NextRequest) {
  // 5 submissions / 10 minutes per IP — enough for a legitimate visitor, blocks spam bursts.
  const { allowed } = rateLimit(`contact:${getClientIp(req)}`, 5, 10 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: 'تعداد درخواست‌ها زیاد است. کمی بعد دوباره تلاش کنید.' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const data = schema.parse(body);

    await db.insert(contacts).values({
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      message: data.message,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.flatten() }, { status: 422 });
    }
    console.error('[contact]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
