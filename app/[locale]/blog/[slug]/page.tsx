import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { getPublishedPostBySlug, type Locale } from '@/lib/posts';

export const revalidate = 300;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPublishedPostBySlug(slug, locale as Locale);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  if (!slug) notFound();

  // Per project rules: if no translation exists for the current locale, show 404 —
  // never fall back to another locale's content.
  const post = await getPublishedPostBySlug(slug, locale as Locale);
  if (!post) notFound();

  const dateLocale = locale === 'en' ? 'en-US' : locale === 'ar' ? 'ar-SA' : 'fa-IR';

  return (
    <main className="flex flex-col min-h-screen">
      <Navbar />
      <article className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-16">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">{post.title}</h1>
        {post.publishedAt && (
          <p className="text-muted-foreground text-sm mb-8">
            {new Date(post.publishedAt).toLocaleDateString(dateLocale)}
          </p>
        )}
        <div
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content ?? '' }}
        />
      </article>
      <Footer />
    </main>
  );
}
