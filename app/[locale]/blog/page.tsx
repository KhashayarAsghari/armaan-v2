import { setRequestLocale } from 'next-intl/server';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BlogPreview } from '@/components/home/BlogPreview';
import { getPublishedPosts, type Locale } from '@/lib/posts';

export const revalidate = 300;

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const blogPosts = await getPublishedPosts('blog', locale as Locale);

  return (
    <main className="flex flex-col min-h-screen">
      <Navbar />
      <div className="pt-10 flex-1">
        <BlogPreview posts={blogPosts} />
      </div>
      <Footer />
    </main>
  );
}
