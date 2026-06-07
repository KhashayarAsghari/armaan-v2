import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/home/Hero';
import { About } from '@/components/home/About';
import { Services } from '@/components/home/Services';
import { BlogPreview } from '@/components/home/BlogPreview';
import { Testimonials } from '@/components/home/Testimonials';
import { Contact } from '@/components/home/Contact';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const titles: Record<string, string> = {
    fa: 'دفتر حقوقی آرمان | خدمات گمرکی، حقوقی و تجاری',
    en: 'Armaan Legal Office | Customs, Legal & Trade Services',
    ar: 'مكتب آرمان القانوني | الخدمات الجمركية والقانونية والتجارية',
  };
  return { title: titles[locale] ?? titles.fa };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="flex flex-col min-h-screen">
      <Navbar />
      <Hero />
      <About />
      {/* Gold divider */}
      <div className="py-4">
        <div className="gold-divider" />
      </div>
      <Services />
      <div className="py-4">
        <div className="gold-divider" />
      </div>
      <BlogPreview />
      <Testimonials />
      <Contact />
      <Footer />
    </main>
  );
}
