import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { ArrowLeft, ArrowRight, Landmark, Scale, ShieldCheck } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

type Locale = 'fa' | 'en' | 'ar';

type AboutContent = {
  badge: string;
  title: string;
  subtitle: string;
  sectionTitle: string;
  paragraphs: string[];
  highlights: Array<{
    title: string;
    description: string;
  }>;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
};

const contentByLocale: Record<Locale, AboutContent> = {
  fa: {
    badge: 'سرآمد آرمان',
    title: 'درباره شرکت کارگزاری سرآمد آرمان',
    subtitle: 'پیشرو در ارائه خدمات تجارت خارجی، گمرکی، حقوقی و بانکی با رویکردی جامع و تخصصی',
    sectionTitle: 'شریک مطمئن شما در مسیر تجارت بین الملل',
    paragraphs: [
      'کارگزاران سرآمد آرمان، پیشرو در ارائه خدمات تجارت خارجی و گمرکی با رویکردی جامع و تخصصی است. ما مسیر پیچیده تجارت بین‌الملل را با تیم متخصص بانکی، حقوقی و گمرکی و زیرساخت‌های هوشمند، برای مشتریان خود شفاف، ایمن و قابل مدیریت می‌سازیم.',
      'از شرکت‌های نوپا تا برندهای بزرگ، ما نه تنها خدمات ترخیص و گمرکی ارائه می‌کنیم، بلکه حل مسائل حقوقی و مالی، نظارت دقیق قراردادها و مدیریت فرآیندهای تجاری را نیز تضمین می‌کنیم.',
      'با کارگزاران سرآمد آرمان، تجارت شما فراتر از فرآیندهای اداری بوده و به تجربه‌ای بی‌دغدغه، قابل اتکا و قابل پیش‌بینی تبدیل می‌گردد.',
    ],
    highlights: [
      {
        title: 'تخصص چند‌بعدی',
        description: 'هم‌افزایی تیم‌های حقوقی، بانکی و گمرکی برای پوشش کامل نیازهای تجارت خارجی شما.',
      },
      {
        title: 'مدیریت دقیق قراردادها',
        description: 'کنترل ریسک حقوقی و مالی با نظارت جزئی نگر در تمام مراحل قراردادهای تجاری.',
      },
      {
        title: 'زیرساخت هوشمند عملیاتی',
        description: 'فرآیندهای شفاف، قابل ردیابی و قابل پیش‌بینی برای تصمیم گیری بهتر و سریع‌تر.',
      },
    ],
    ctaTitle: 'آماده شروع همکاری هستید؟',
    ctaSubtitle: 'برای ارزیابی پرونده و دریافت مسیر اجرایی، با تیم ما در تماس باشید.',
    ctaPrimary: 'درخواست مشاوره',
    ctaSecondary: 'مطالعه بلاگ',
  },
  en: {
    badge: 'SarAmad Armaan',
    title: 'About SarAmad Armaan Brokerage',
    subtitle:
      'A leading firm in foreign trade, customs, legal, and banking services with a comprehensive, expert-led approach.',
    sectionTitle: 'Your trusted partner in international trade',
    paragraphs: [
      'SarAmad Armaan Brokerage is a pioneer in delivering foreign trade and customs services through a comprehensive and specialized approach. With expert legal, banking, and customs teams plus smart infrastructure, we make complex international trade processes transparent, secure, and manageable for our clients.',
      'From startups to large brands, we do more than customs clearance. We also ensure legal and financial issue resolution, precise contract oversight, and reliable management of end-to-end trade operations.',
      'With SarAmad Armaan, your business moves beyond administrative complexity and turns into a dependable, low-friction, and predictable experience.',
    ],
    highlights: [
      {
        title: 'Multidisciplinary expertise',
        description: 'Coordinated legal, banking, and customs capabilities for full trade lifecycle support.',
      },
      {
        title: 'Contract precision',
        description: 'Detailed oversight to reduce legal and financial risk across commercial agreements.',
      },
      {
        title: 'Smart operational infrastructure',
        description: 'Transparent and trackable workflows for faster and more confident decisions.',
      },
    ],
    ctaTitle: 'Ready to work with us?',
    ctaSubtitle: 'Reach out for a case review and a practical execution roadmap.',
    ctaPrimary: 'Request Consultation',
    ctaSecondary: 'Read the Blog',
  },
  ar: {
    badge: 'سرآمد آرمان',
    title: 'نبذة عن شركة سرآمد آرمان للوساطة',
    subtitle: 'ريادة في خدمات التجارة الخارجية والجمارك والشؤون القانونية والمصرفية بمنهج شامل ومتخصص.',
    sectionTitle: 'شريككم الموثوق في التجارة الدولية',
    paragraphs: [
      'تعد شركة سرآمد آرمان من الجهات الرائدة في تقديم خدمات التجارة الخارجية والجمارك بمنهجية شاملة ومتخصصة. وبالاعتماد على فريق خبير في الجوانب المصرفية والقانونية والجمركية وبنية ذكية، نجعل مسار التجارة الدولية المعقد أكثر وضوحًا وأمانًا وسهولة في الإدارة لعملائنا.',
      'من الشركات الناشئة إلى العلامات الكبرى، لا نكتفي بخدمات التخليص الجمركي، بل نضمن أيضًا معالجة القضايا القانونية والمالية، والمتابعة الدقيقة للعقود، وإدارة العمليات التجارية بكفاءة عالية.',
      'مع سرآمد آرمان، تتحول تجارتكم من عبء الإجراءات الإدارية إلى تجربة سلسة وموثوقة ويمكن التنبؤ بها.',
    ],
    highlights: [
      {
        title: 'خبرة متعددة التخصصات',
        description: 'تكامل قانوني ومصرفي وجمركي لدعم جميع مراحل التجارة الخارجية.',
      },
      {
        title: 'إدارة دقيقة للعقود',
        description: 'تقليل المخاطر القانونية والمالية عبر متابعة تفصيلية للعقود التجارية.',
      },
      {
        title: 'بنية تشغيل ذكية',
        description: 'مسارات عمل واضحة وقابلة للتتبع لقرارات أسرع وأكثر ثقة.',
      },
    ],
    ctaTitle: 'هل أنتم جاهزون لبدء التعاون؟',
    ctaSubtitle: 'تواصلوا معنا لتقييم الحالة ووضع خارطة تنفيذ عملية.',
    ctaPrimary: 'طلب استشارة',
    ctaSecondary: 'قراءة المدونة',
  },
};

const metadataByLocale: Record<Locale, Metadata> = {
  fa: {
    title: 'درباره ما | کارگزاران سرآمد آرمان',
    description:
      'آشنایی با کارگزاران سرآمد آرمان و رویکرد تخصصی ما در مدیریت خدمات تجارت خارجی، گمرکی، حقوقی و بانکی.',
  },
  en: {
    title: 'About Us | SarAmad Armaan Brokerage',
    description:
      'Learn more about SarAmad Armaan and our specialized approach to customs, legal, banking, and foreign trade services.',
  },
  ar: {
    title: 'من نحن | سرآمد آرمان',
    description:
      'تعرفوا على سرآمد آرمان ومنهجنا المتخصص في إدارة خدمات التجارة الخارجية والجمارك والجوانب القانونية والمصرفية.',
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const normalizedLocale = (locale in contentByLocale ? locale : 'fa') as Locale;
  return metadataByLocale[normalizedLocale];
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const normalizedLocale = (locale in contentByLocale ? locale : 'fa') as Locale;
  const content = contentByLocale[normalizedLocale];
  const Arrow = normalizedLocale === 'en' ? ArrowRight : ArrowLeft;
  const highlightIcons = [ShieldCheck, Scale, Landmark];

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <section className="relative overflow-hidden border-b border-white/6 px-4 pb-14 pt-20 sm:px-6 lg:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#C4A24D20,transparent_50%),radial-gradient(circle_at_bottom_left,#1C2B4A55,transparent_60%)]" />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-background/40 to-background" />
        <div className="relative mx-auto flex w-full max-w-7xl flex-col items-start gap-5">
          <span className="inline-flex items-center rounded-full border border-[#C4A24D]/25 bg-[#C4A24D]/10 px-4 py-1.5 text-xs font-semibold text-[#C4A24D]">
            {content.badge}
          </span>
          <h1 className="max-w-4xl text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
            {content.title}
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">{content.subtitle}</p>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-7 lg:grid-cols-12">
          <article className="lg:col-span-8 rounded-3xl border border-white/8 bg-card p-7 shadow-2xl shadow-black/8 sm:p-9">
            <div className="mb-5 h-0.5 w-16 bg-linear-to-r from-[#C4A24D] to-[#D4B86A]" />
            <h2 className="mb-6 text-2xl font-bold text-foreground sm:text-3xl">{content.sectionTitle}</h2>
            <div className="space-y-5 text-sm text-foreground/85 sm:text-base">
              {content.paragraphs.map((paragraph) => (
                <p key={paragraph} className="leading-8">
                  {paragraph}
                </p>
              ))}
            </div>
          </article>

          <aside className="lg:col-span-4 space-y-4">
            {content.highlights.map((item, index) => {
              const Icon = highlightIcons[index];
              return (
                <div
                  key={item.title}
                  className="group rounded-2xl border border-white/8 bg-linear-to-br from-[#1C2B4A] to-[#111827] p-5 shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:border-[#C4A24D]/35"
                >
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#C4A24D]/35 bg-[#C4A24D]/15 text-[#D4B86A]">
                    <Icon size={18} />
                  </div>
                  <h3 className="mb-2 text-base font-bold text-white">{item.title}</h3>
                  <p className="text-sm leading-7 text-white/75">{item.description}</p>
                </div>
              );
            })}

            <div className="rounded-2xl border border-[#C4A24D]/20 bg-[#C4A24D]/8 p-5">
              <h3 className="mb-2 text-base font-bold text-foreground">{content.ctaTitle}</h3>
              <p className="mb-4 text-sm leading-7 text-muted-foreground">{content.ctaSubtitle}</p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-[#C4A24D] px-5 py-2.5 text-sm font-bold text-black transition-all duration-300 hover:bg-[#D4B86A]"
                >
                  {content.ctaPrimary}
                  <Arrow size={16} />
                </Link>
                <Link
                  href="/blog"
                  className="inline-flex items-center rounded-full border border-[#C4A24D]/35 px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-[#C4A24D]/10"
                >
                  {content.ctaSecondary}
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </main>
  );
}
