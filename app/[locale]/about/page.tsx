import { setRequestLocale } from 'next-intl/server';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { About } from '@/components/home/About';

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main className="flex flex-col min-h-screen">
      <Navbar />
      <div className="pt-10">
        <About />
      </div>
      <Footer />
    </main>
  );
}
