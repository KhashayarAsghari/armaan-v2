import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  if (!slug) notFound();

  return (
    <main className="flex flex-col min-h-screen">
      <Navbar />
      <article className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-16">
        <p className="text-muted-foreground text-sm mb-6">/{locale}/blog/{slug}</p>
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-muted-foreground">محتوای این مقاله از پایگاه داده بارگذاری می‌شود.</p>
        </div>
      </article>
      <Footer />
    </main>
  );
}
