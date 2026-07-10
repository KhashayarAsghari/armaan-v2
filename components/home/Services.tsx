'use client';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Gavel, ShieldCheck, Truck, Workflow } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';

const services = [
  { icon: ShieldCheck, key: 's1' },
  { icon: Truck, key: 's2' },
  { icon: BriefcaseBusiness, key: 's3' },
  { icon: Gavel, key: 's4' },
  { icon: Workflow, key: 's5' },
];

export function Services() {
  const t = useTranslations('services');
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
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-4 sm:px-6 lg:px-10 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="gold-divider mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">{t('title')}</h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {services.map(({ icon: Icon, key }, i) => (
            <Link
              key={key}
              href="/consultation"
              data-card
              data-delay={i * 100}
              className="reveal group rounded-3xl border border-[#C4A24D]/12 bg-[#1C2B4A] p-8 sm:p-10 hover:border-[#C4A24D]/40 hover:shadow-2xl hover:shadow-[#C4A24D]/8 hover:-translate-y-1 transition-all duration-400"
            >
              <div className="w-14 h-14 mb-6 flex items-center justify-center rounded-2xl bg-[#C4A24D]/10 border border-[#C4A24D]/20 group-hover:bg-[#C4A24D]/20 transition-colors duration-300">
                <Icon size={26} className="text-[#C4A24D]" />
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white mb-3">
                {t(`${key}Title`)}
              </h3>
              <p className="text-white/65 text-sm sm:text-base leading-relaxed">
                {t(`${key}Desc`)}
              </p>

              <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#D4B86A]">
                {t('consultCta')}
                <Arrow size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
