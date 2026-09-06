import { db } from '@/lib/db';
import { posts, postTranslations } from '@/lib/schema';
import { and, desc, eq } from 'drizzle-orm';

export type PostCategory = 'blog' | 'article' | 'news' | 'tutorial';
export type Locale = 'fa' | 'en' | 'ar';

export type PostSummary = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  publishedAt: Date | null;
};

export type PostDetail = PostSummary & {
  category: PostCategory;
  content: string | null;
};

/**
 * Returns published posts for a given category + locale, newest first.
 * Only posts that have a translation row for the requested locale are returned
 * (per the "no fallback to another locale" rule) — never fabricated content.
 * Returns [] on any DB error so public pages degrade gracefully instead of crashing.
 */
export async function getPublishedPosts(
  category: PostCategory,
  locale: Locale,
  limit?: number
): Promise<PostSummary[]> {
  try {
    const rows = await db
      .select({
        id: posts.id,
        slug: posts.slug,
        publishedAt: posts.publishedAt,
        title: postTranslations.title,
        excerpt: postTranslations.excerpt,
      })
      .from(posts)
      .innerJoin(
        postTranslations,
        and(eq(postTranslations.postId, posts.id), eq(postTranslations.locale, locale))
      )
      .where(and(eq(posts.category, category), eq(posts.published, true)))
      .orderBy(desc(posts.publishedAt));

    return limit ? rows.slice(0, limit) : rows;
  } catch (err) {
    console.error('[getPublishedPosts]', err);
    return [];
  }
}

export async function getPublishedPostBySlug(slug: string, locale: Locale): Promise<PostDetail | null> {
  try {
    const [row] = await db
      .select({
        id: posts.id,
        slug: posts.slug,
        category: posts.category,
        publishedAt: posts.publishedAt,
        title: postTranslations.title,
        excerpt: postTranslations.excerpt,
        content: postTranslations.content,
      })
      .from(posts)
      .innerJoin(
        postTranslations,
        and(eq(postTranslations.postId, posts.id), eq(postTranslations.locale, locale))
      )
      .where(and(eq(posts.slug, slug), eq(posts.published, true)));

    return row ?? null;
  } catch (err) {
    console.error('[getPublishedPostBySlug]', err);
    return null;
  }
}
