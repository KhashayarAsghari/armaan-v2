import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ConsultationPageContent } from '@/components/consultation/ConsultationPageContent';

type Locale = 'fa' | 'en' | 'ar';

const metadataByLocale: Record<Locale, Metadata> = {
  fa: {
    title: 'درخواست مشاوره | کارگزاران سرآمد آرمان',
    description:
      'فرم تخصصی درخواست مشاوره کارگزاران سرآمد آرمان در حوزه کارگزاری گمرکی، بازرگانی، حقوقی، حمل و نقل و آموزش تخصصی.',
  },
  en: {
    title: 'Consultation Request | SarAmad Armaan',
    description:
      'Submit your consultation request for customs brokerage, trade advisory, legal advisory, transportation, and specialized training.',
  },
  ar: {
    title: 'طلب استشارة | سرآمد آرمان',
    description:
      'أرسل طلب الاستشارة في مجالات الوساطة الجمركية والاستشارات التجارية والقانونية وخدمات النقل والتدريب المتخصص.',
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const normalizedLocale = (locale in metadataByLocale ? locale : 'fa') as Locale;
  return metadataByLocale[normalizedLocale];
}

export default async function ConsultationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1 pt-10">
        <ConsultationPageContent />
      </div>
      <Footer />
    </main>
  );
}
