import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { z } from 'zod';
import { signAuthToken, authCookieOptions, AUTH_COOKIE_NAME } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  // 10 attempts / 5 minutes per IP — slows down brute-force login attempts.
  const ip = getClientIp(req);
  const { allowed } = rateLimit(`login:${ip}`, 10, 5 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: 'تلاش‌های زیاد. کمی بعد دوباره امتحان کنید.' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { email, password } = schema.parse(body);

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!adminEmail || !adminPasswordHash) {
      console.error('[auth/login] ADMIN_EMAIL or ADMIN_PASSWORD_HASH is not configured');
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const emailMatches = email.toLowerCase() === adminEmail.toLowerCase();
    const passwordMatches = await compare(password, adminPasswordHash);

    if (!emailMatches || !passwordMatches) {
      return NextResponse.json({ error: 'ایمیل یا رمز عبور اشتباه است' }, { status: 401 });
    }

    const token = await signAuthToken({ email: adminEmail, role: 'admin' });

    const res = NextResponse.json({ success: true });
    res.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions);
    return res;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'ورودی نامعتبر' }, { status: 422 });
    }
    console.error('[auth/login]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
