'use client';
import { useTranslations, useLocale } from 'next-intl';
import { Star, Quote } from 'lucide-react';
import { useEffect, useRef } from 'react';

const testimonials = [
  {
    nameFa: 'محمد رضایی',
    nameEn: 'Mohammad Rezaei',
    nameAr: 'محمد رضائي',
    roleFa: 'مدیر عامل، شرکت بازرگانی ستاره',
    roleEn: 'CEO, Setareh Trading Co.',
    roleAr: 'المدير التنفيذي، شركة ستاره التجارية',
    textFa: 'دفتر حقوقی آرمان در کمترین زمان ممکن کالای ما را از گمرک ترخیص کرد. حرفه‌ای‌ترین تیمی که در این حوزه دیده‌ام.',
    textEn: 'Armaan Legal cleared our goods from customs in record time. The most professional team I\'ve encountered in this field.',
    textAr: 'أنجز مكتب آرمان القانوني تخليص بضائعنا جمركياً في أسرع وقت ممكن. أكثر فريق محترف صادفته في هذا المجال.',
  },
  {
    nameFa: 'سارا میرزایی',
    nameEn: 'Sara Mirzaei',
    nameAr: 'سارة ميرزائي',
    roleFa: 'مدیر تجارت خارجی، گروه صنعتی البرز',
    roleEn: 'Foreign Trade Manager, Alborz Industrial Group',
    roleAr: 'مدير التجارة الخارجية، المجموعة الصناعية البرز',
    textFa: 'مشاوره حقوقی دقیق و پیگیری مستمر آرمان باعث شد بتوانیم قرارداد بزرگی را با شریک خارجی خود منعقد کنیم.',
    textEn: 'Armaan\'s precise legal advice and continuous follow-up allowed us to close a major contract with our foreign partner.',
    textAr: 'أتاحت لنا المشورة القانونية الدقيقة والمتابعة المستمرة من آرمان إبرام عقد كبير مع شريكنا الأجنبي.',
  },
  {
    nameFa: 'حسین احمدی',
    nameEn: 'Hossein Ahmadi',
    nameAr: 'حسين أحمدي',
    roleFa: 'بنیان‌گذار، هلدینگ پارس',
    roleEn: 'Founder, Pars Holding',
    roleAr: 'المؤسس، هولدينغ پارس',
    textFa: 'سیستم پیگیری آنلاین آرمان یک مزیت رقابتی واقعی است. در هر لحظه از وضعیت مرسولاتم مطلع هستم.',
    textEn: 'Armaan\'s online tracking system is a real competitive advantage. I\'m informed about my shipment status at any moment.',
    textAr: 'نظام التتبع عبر الإنترنت في آرمان ميزة تنافسية حقيقية. أكون على دراية بحالة شحناتي في أي لحظة.',
  },
];

export function Testimonials() {
  const t = useTranslations('testimonials');
  const locale = useLocale();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const cards = section.querySelectorAll<HTMLElement>('[data-card]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement;
            setTimeout(() => el.classList.add('visible'), Number(el.dataset.delay ?? 0));
          }
        });
      },
      { threshold: 0.1 }
    );
    cards.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, []);

  function getName(t: typeof testimonials[0]) {
    return locale === 'en' ? t.nameEn : locale === 'ar' ? t.nameAr : t.nameFa;
  }
  function getRole(t: typeof testimonials[0]) {
    return locale === 'en' ? t.roleEn : locale === 'ar' ? t.roleAr : t.roleFa;
  }
  function getText(t: typeof testimonials[0]) {
    return locale === 'en' ? t.textEn : locale === 'ar' ? t.textAr : t.textFa;
  }

  return (
    <section ref={sectionRef} className="py-24 px-4 sm:px-6 lg:px-10 bg-background/50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="gold-divider mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">{t('title')}</h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, i) => (
            <div
              key={i}
              data-card
              data-delay={i * 120}
              className="reveal rounded-3xl border border-white/6 bg-card p-7 hover:border-[#C4A24D]/25 hover:shadow-xl transition-all duration-400"
            >
              <Quote size={28} className="text-[#C4A24D]/40 mb-4" />

              <div className="flex gap-1 mb-4">
                {Array(5).fill(0).map((_, j) => (
                  <Star key={j} size={14} className="text-[#C4A24D] fill-[#C4A24D]" />
                ))}
              </div>

              <p className="text-foreground/80 text-sm leading-relaxed mb-6">
                {getText(item)}
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-white/6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C4A24D]/40 to-[#1C2B4A] flex items-center justify-center text-sm font-bold text-white shrink-0">
                  {getName(item)[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{getName(item)}</p>
                  <p className="text-xs text-muted-foreground">{getRole(item)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
