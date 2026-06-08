import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { PostForm } from '@/components/editor/PostForm';
import { db } from '@/lib/db';
import { posts, postTranslations } from '@/lib/schema';
import { eq } from 'drizzle-orm';

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function EditPostPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const postId = Number(id);
  if (isNaN(postId)) notFound();

  const [post] = await db.select().from(posts).where(eq(posts.id, postId));
  if (!post) notFound();

  const translations = await db
    .select()
    .from(postTranslations)
    .where(eq(postTranslations.postId, postId));

  const initialTranslations = Object.fromEntries(
    translations.map((t) => [
      t.locale,
      {
        title: t.title ?? '',
        excerpt: t.excerpt ?? '',
        content: t.content ?? '',
      },
    ])
  );

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">ویرایش مقاله</h1>
        <p className="text-sm text-muted-foreground mt-1 font-mono">{post.slug}</p>
      </div>
      <PostForm
        postId={postId}
        initialSlug={post.slug}
        initialCategory={post.category}
        initialPublished={post.published}
        initialTranslations={initialTranslations}
      />
    </div>
  );
}
