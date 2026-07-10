'use client';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowLeft, ArrowRight, BriefcaseBusiness, PhoneCall } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useEffect, useRef } from 'react';

export function About() {
  const t = useTranslations('about');
  const locale = useLocale();
  const Arrow = locale === 'en' ? ArrowRight : ArrowLeft;
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const els = section.querySelectorAll<HTMLElement>('[data-reveal]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-4 sm:px-6 lg:px-10 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16" data-reveal>
          <div className="gold-divider mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{t('title')}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div
            className="reveal-right rounded-3xl overflow-hidden border border-white/6 bg-[#1C2B4A] shadow-2xl p-8 sm:p-10"
            data-reveal
          >
            <div className="w-12 h-12 rounded-2xl border border-[#C4A24D]/25 bg-[#C4A24D]/10 text-[#C4A24D] flex items-center justify-center mb-6">
              <BriefcaseBusiness size={22} />
            </div>
            <div className="w-10 h-0.5 bg-[#C4A24D] mb-5" />
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">{t('card1Title')}</h3>
            <p className="text-white/70 text-sm sm:text-base leading-8">{t('card1Desc')}</p>
            <Link
              href="/consultation"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#D4B86A] hover:text-[#E2C980] transition-colors"
            >
              {t('card1Cta')}
              <Arrow size={15} />
            </Link>
          </div>

          <div
            className="reveal-left rounded-3xl overflow-hidden border border-white/6 bg-card shadow-2xl p-8 sm:p-10"
            data-reveal
          >
            <div className="w-12 h-12 rounded-2xl border border-[#C4A24D]/25 bg-[#C4A24D]/10 text-[#C4A24D] flex items-center justify-center mb-6">
              <PhoneCall size={22} />
            </div>
            <div className="w-10 h-0.5 bg-[#C4A24D] mb-5" />
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4">{t('card2Title')}</h3>
            <p className="text-muted-foreground text-sm sm:text-base leading-8">{t('card2Desc')}</p>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#C4A24D] hover:text-[#D4B86A] transition-colors"
            >
              {t('card2Cta')}
              <Arrow size={15} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
