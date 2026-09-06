import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts, postTranslations } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';
import { requireAuth } from '@/lib/require-auth';
import { getSessionFromRequest } from '@/lib/auth';

const translationSchema = z.object({
  title: z.string().max(500).default(''),
  excerpt: z.string().optional(),
  content: z.string().optional(),
});

const schema = z.object({
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  category: z.enum(['blog', 'article', 'news', 'tutorial']).default('blog'),
  published: z.boolean().default(false),
  translations: z.record(z.enum(['fa', 'en', 'ar']), translationSchema),
});

export async function POST(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const [result] = await db.insert(posts).values({
      slug: data.slug,
      category: data.category,
      published: data.published,
      publishedAt: data.published ? new Date() : null,
    });

    const postId = (result as { insertId: number }).insertId;

    // Only insert translations that have a non-empty title
    const translationRows = Object.entries(data.translations)
      .filter(([, t]) => t.title.trim() !== '')
      .map(([locale, t]) => ({
        postId,
        locale: locale as 'fa' | 'en' | 'ar',
        title: t.title,
        excerpt: t.excerpt ?? null,
        content: t.content ?? null,
      }));

    if (translationRows.length > 0) {
      await db.insert(postTranslations).values(translationRows);
    }

    return NextResponse.json({ id: postId }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.flatten() }, { status: 422 });
    }
    console.error('[posts POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // Public callers (no valid admin session) may only ever see published posts.
    const session = await getSessionFromRequest(req);
    const isAdmin = !!session;

    const rows = await db
      .select({
        id: posts.id,
        slug: posts.slug,
        category: posts.category,
        published: posts.published,
        createdAt: posts.createdAt,
        faTitle: postTranslations.title,
      })
      .from(posts)
      .leftJoin(
        postTranslations,
        eq(postTranslations.postId, posts.id)
      )
      .where(isAdmin ? undefined : eq(posts.published, true))
      .orderBy(desc(posts.createdAt));

    // Collapse: one row per post (take first fa translation title found)
    const map = new Map<number, typeof rows[0]>();
    for (const row of rows) {
      if (!map.has(row.id)) {
        map.set(row.id, row);
      } else if (row.faTitle) {
        // prefer a row that has a title
        map.set(row.id, row);
      }
    }

    return NextResponse.json(Array.from(map.values()));
  } catch (err) {
    console.error('[posts GET]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
