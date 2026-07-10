import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default async function TutorialsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('tutorialsPage');

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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['item1', 'item2', 'item3'].map((item) => (
              <div key={item} className="rounded-3xl border border-white/8 bg-card p-6">
                <div className="h-36 rounded-2xl bg-[#1C2B4A]/80 mb-4" />
                <h2 className="text-lg font-bold text-foreground mb-2">{t(`${item}.title`)}</h2>
                <p className="text-sm text-muted-foreground leading-7">{t(`${item}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
