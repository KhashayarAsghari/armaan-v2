import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { GraduationCap } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { getPublishedPosts, type Locale } from '@/lib/posts';

export const revalidate = 300;

export default async function TutorialsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('tutorialsPage');

  const tutorials = await getPublishedPosts('tutorial', locale as Locale);

  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <section className="flex-1 px-4 py-20 sm:px-6 lg:px-10 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="gold-divider mb-6" />
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{t('title')}</h1>
            <p className="text-muted-foreground">{t('subtitle')}</p>
          </div>

          {tutorials.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 rounded-3xl border border-dashed border-white/10 text-muted-foreground gap-3">
              <GraduationCap size={32} className="opacity-40" />
              <p className="text-sm">{t('empty')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tutorials.map((item) => (
                <Link
                  key={item.slug}
                  href={`/blog/${item.slug}`}
                  className="rounded-3xl border border-white/8 bg-card p-6 hover:border-[#C4A24D]/30 transition-colors"
                >
                  <div className="h-36 rounded-2xl bg-[#1C2B4A]/80 mb-4" />
                  <h2 className="text-lg font-bold text-foreground mb-2 line-clamp-2">{item.title}</h2>
                  {item.excerpt && (
                    <p className="text-sm text-muted-foreground leading-7 line-clamp-3">{item.excerpt}</p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
