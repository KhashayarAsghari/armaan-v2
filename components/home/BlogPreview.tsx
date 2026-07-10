'use client';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowLeft, ArrowRight, Calendar } from 'lucide-react';
import { useEffect, useRef } from 'react';

const posts = [
  {
    slug: 'legal-challenges-import-export',
    date: '۱۴۰۵/۳/۴',
    titleFa: 'چالش‌های حقوقی کلیدی در قراردادهای واردات و صادرات که ۵ شرکت‌ها نادیده می‌گیرند',
    titleEn: '5 Key Legal Challenges in Import/Export Contracts Companies Overlook',
    titleAr: '٥ تحديات قانونية رئيسية في عقود الاستيراد والتصدير تتجاهلها الشركات',
    excerptFa: 'معرفی: چرا وکیل بازرگانی بین‌الملل دیگر یک انتخاب نیست، یک ضرورت است؟ در فضای رقابتی امروز، شرکت‌های ایرانی فعال در حوزه ...',
    excerptEn: 'Why an international trade lawyer is no longer optional — it\'s essential. In today\'s competitive landscape...',
    excerptAr: 'لماذا لم يعد محامي التجارة الدولية خياراً بل ضرورة. في المشهد التنافسي اليوم...',
  },
  {
    slug: 'customs-clearance-guide',
    date: '۱۴۰۵/۲/۱۸',
    titleFa: 'راهنمای کامل ترخیص کالا از گمرک: مراحل، مدارک و نکات کلیدی',
    titleEn: 'Complete Guide to Customs Clearance: Steps, Documents & Key Tips',
    titleAr: 'الدليل الشامل لتخليص البضائع جمركياً: الخطوات والوثائق والنصائح الأساسية',
    excerptFa: 'ترخیص کالا یکی از پیچیده‌ترین مراحل تجارت خارجی است. در این مقاله تمام مراحل را گام به گام توضیح می‌دهیم ...',
    excerptEn: 'Customs clearance is one of the most complex stages of foreign trade. In this article we explain every step...',
    excerptAr: 'يُعد التخليص الجمركي من أعقد مراحل التجارة الخارجية. في هذا المقال نشرح كل خطوة...',
  },
  {
    slug: 'trade-card-epl',
    date: '۱۴۰۵/۱/۲۸',
    titleFa: 'کارت بازرگانی و EPL: همه چیزی که باید بدانید',
    titleEn: 'Trade Card & EPL: Everything You Need to Know',
    titleAr: 'بطاقة التجارة وEPL: كل ما تحتاج معرفته',
    excerptFa: 'کارت بازرگانی مجوز اصلی برای ورود به حوزه تجارت خارجی است. در این مقاله شرایط اخذ آن را بررسی می‌کنیم ...',
    excerptEn: 'The trade card is the primary license for entering foreign trade. This article reviews the requirements...',
    excerptAr: 'بطاقة التجارة هي الترخيص الرئيسي للدخول في مجال التجارة الخارجية. نستعرض في هذا المقال الشروط...',
  },
];

export function BlogPreview() {
  const t = useTranslations('blog');
  const locale = useLocale();
  const Arrow = locale === 'en' ? ArrowRight : ArrowLeft;
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const cards = section.querySelectorAll<HTMLElement>('[data-card]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = Number(el.dataset.delay ?? 0);
            setTimeout(() => el.classList.add('visible'), delay);
          }
        });
      },
      { threshold: 0.1 }
    );
    cards.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, []);

  function getTitle(post: typeof posts[0]) {
    if (locale === 'en') return post.titleEn;
    if (locale === 'ar') return post.titleAr;
    return post.titleFa;
  }
  function getExcerpt(post: typeof posts[0]) {
    if (locale === 'en') return post.excerptEn;
    if (locale === 'ar') return post.excerptAr;
    return post.excerptFa;
  }

  return (
    <section ref={sectionRef} className="py-24 px-4 sm:px-6 lg:px-10 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="w-8 h-0.5 bg-[#C4A24D] mb-4" />
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">{t('title')}</h2>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#C4A24D]/40 text-[#C4A24D] hover:bg-[#C4A24D] hover:text-black text-sm font-medium transition-all duration-300"
          >
            {t('viewAll')}
            <Arrow size={14} />
          </Link>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              data-card
              data-delay={i * 100}
              className="reveal group rounded-3xl overflow-hidden border border-white/6 bg-card hover:border-[#C4A24D]/30 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/30 transition-all duration-400"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden bg-[#1C2B4A]">
                <div
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                  style={{
                    backgroundImage:
                      i % 3 === 0
                        ? 'linear-gradient(135deg, #1C2B4A, #0d0d0d)'
                        : i % 3 === 1
                          ? 'linear-gradient(135deg, #13233f, #0f172a)'
                          : 'linear-gradient(135deg, #2d1f0f, #0f172a)',
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <Calendar size={12} />
                  <span>{post.date}</span>
                </div>
                <h3 className="text-base font-bold text-foreground mb-3 line-clamp-2 group-hover:text-[#C4A24D] transition-colors duration-300">
                  {getTitle(post)}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  {getExcerpt(post)}
                </p>
                <div className="mt-5 flex items-center gap-1.5 text-sm text-[#C4A24D] font-medium">
                  {t('readMore')}
                  <Arrow size={13} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
