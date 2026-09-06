import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

export const AUTH_COOKIE_NAME = 'armaan_admin_token';
const SESSION_DURATION_SECONDS = 60 * 60 * 24; // 24h

export type SessionPayload = {
  email: string;
  role: 'admin';
};

function getJwtSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      'JWT_SECRET is not set or is too short. Set a long random value in the environment (see .env.example).'
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signAuthToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getJwtSecretKey());
}

export async function verifyAuthToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    if (payload.email && payload.role === 'admin') {
      return { email: payload.email as string, role: 'admin' };
    }
    return null;
  } catch {
    return null;
  }
}

/** Reads and verifies the admin session from the Next.js cookies() API (server components / route handlers). */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAuthToken(token);
}

/** Reads and verifies the admin session from a NextRequest (usable in route handlers / middleware). */
export async function getSessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAuthToken(token);
}

export const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_DURATION_SECONDS,
};
