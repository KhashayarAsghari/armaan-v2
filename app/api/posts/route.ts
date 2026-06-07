import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts, postTranslations } from '@/lib/schema';
import { z } from 'zod';

const translationSchema = z.object({
  title: z.string().min(1).max(500),
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

    const translationRows = Object.entries(data.translations).map(([locale, t]) => ({
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
    console.error('[posts]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const allPosts = await db.select().from(posts).orderBy(posts.createdAt);
    return NextResponse.json(allPosts);
  } catch (err) {
    console.error('[posts GET]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
