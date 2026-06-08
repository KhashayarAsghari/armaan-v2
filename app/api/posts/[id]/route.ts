import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts, postTranslations } from '@/lib/schema';
import { eq, and, ne } from 'drizzle-orm';
import { z } from 'zod';

type Params = { params: Promise<{ id: string }> };

// ── GET /api/posts/[id] ──────────────────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const postId = Number(id);

    const [post] = await db.select().from(posts).where(eq(posts.id, postId));
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const translations = await db
      .select()
      .from(postTranslations)
      .where(eq(postTranslations.postId, postId));

    return NextResponse.json({ ...post, translations });
  } catch (err) {
    console.error('[posts/id GET]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── PUT /api/posts/[id] ──────────────────────────────────────────────────────
const translationSchema = z.object({
  title: z.string().max(500).default(''),
  excerpt: z.string().optional(),
  content: z.string().optional(),
});

const updateSchema = z.object({
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  category: z.enum(['blog', 'article', 'news', 'tutorial']),
  published: z.boolean(),
  translations: z.record(z.enum(['fa', 'en', 'ar']), translationSchema),
});

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const postId = Number(id);
    const body = await req.json();
    const data = updateSchema.parse(body);

    // Check slug uniqueness (exclude current post)
    const existing = await db
      .select({ id: posts.id })
      .from(posts)
      .where(and(eq(posts.slug, data.slug), ne(posts.id, postId)));
    if (existing.length > 0) {
      return NextResponse.json({ error: 'این اسلاگ قبلاً استفاده شده' }, { status: 409 });
    }

    // Update post
    await db
      .update(posts)
      .set({
        slug: data.slug,
        category: data.category,
        published: data.published,
        publishedAt: data.published ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, postId));

    // Replace translations: delete all, then insert non-empty ones
    await db.delete(postTranslations).where(eq(postTranslations.postId, postId));

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

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 422 });
    }
    console.error('[posts/id PUT]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── DELETE /api/posts/[id] ───────────────────────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const postId = Number(id);

    await db.delete(postTranslations).where(eq(postTranslations.postId, postId));
    await db.delete(posts).where(eq(posts.id, postId));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[posts/id DELETE]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
