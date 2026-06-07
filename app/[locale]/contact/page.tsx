import { setRequestLocale } from 'next-intl/server';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Contact } from '@/components/home/Contact';

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main className="flex flex-col min-h-screen">
      <Navbar />
      <div className="pt-10 flex-1">
        <Contact />
      </div>
      <Footer />
    </main>
  );
}
