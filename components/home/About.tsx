'use client';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useRef } from 'react';

const stats = [
  { value: '۱۰+', key: 'years' },
  { value: '۵۰۰+', key: 'clients' },
  { value: '۲۰۰۰+', key: 'cases' },
  { value: '۳۰+', key: 'countries' },
];

export function About() {
  const t = useTranslations('about');
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
        {/* Section header */}
        <div className="text-center mb-16" data-reveal>
          <div className="gold-divider mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{t('title')}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">{t('subtitle')}</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-20" data-reveal>
          {stats.map((stat) => (
            <div
              key={stat.key}
              className="text-center py-6 px-4 rounded-2xl border border-[#C4A24D]/15 bg-[#C4A24D]/4 hover:border-[#C4A24D]/40 hover:bg-[#C4A24D]/8 transition-all duration-300"
            >
              <p className="text-3xl sm:text-4xl font-bold text-gold-gradient mb-1">{stat.value}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{t(`stats.${stat.key}`)}</p>
            </div>
          ))}
        </div>

        {/* Cards */}
        <div className="space-y-8">
          {/* Card 1 */}
          <div
            className="relative reveal-right flex flex-col md:flex-row-reverse items-stretch rounded-3xl overflow-hidden border border-white/6 bg-[#1C2B4A] shadow-2xl"
            data-reveal
          >
            <div className="hidden md:block md:w-full relative min-h-70">
              <Image
                src="/home-images/stack2.png"
                alt="Professional customs services"
                fill
                className="object-cover object-top -translate-x-5"
              />
              <div className="hidden md:block absolute inset-0 bg-linear-to-l from-[#1C2B4A]/80 to-transparent" />
            </div>
            <div className="relative md:absolute md:top-1/2 md:-translate-y-1/2 md:right-0 md:w-1/2 p-8 sm:p-10 flex flex-col justify-center">
              <div className="w-10 h-0.5 bg-[#C4A24D] mb-5" />
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">{t('card1Title')}</h3>
              <p className="text-white/70 text-sm sm:text-base leading-relaxed">{t('card1Desc')}</p>
            </div>
          </div>

          {/* Card 2 */}
          <div
            className="relative reveal-left flex flex-col md:flex-row items-stretch rounded-3xl overflow-hidden border border-white/6 bg-[#1C2B4A] shadow-2xl"
            data-reveal
          >
            <div className="hidden md:block md:w-full relative min-h-70">
              <Image
                src="/home-images/stack1.png"
                alt="Smart trade solutions"
                fill
                className="object-cover object-top"
              />
              <div className="hidden md:block absolute inset-0 bg-linear-to-r from-[#1C2B4A]/80 to-transparent" />
            </div>
            <div className="relative md:absolute md:top-1/2 md:-translate-y-1/2 md:left-0 md:w-1/2 p-8 sm:p-10 flex flex-col justify-center">
              <div className="w-10 h-0.5 bg-[#C4A24D] mb-5" />
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">{t('card2Title')}</h3>
              <p className="text-white/70 text-sm sm:text-base leading-relaxed">{t('card2Desc')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
