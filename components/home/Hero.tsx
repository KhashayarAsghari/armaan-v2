'use client';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useEffect, useRef } from 'react';

export function Hero() {
  const t = useTranslations('hero');
  const locale = useLocale();
  const Arrow = locale === 'en' ? ArrowRight : ArrowLeft;

  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = [headlineRef.current, subRef.current, ctaRef.current];
    els.forEach((el, i) => {
      if (!el) return;
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      setTimeout(() => {
        if (!el) return;
        el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 200 + i * 150);
    });
  }, []);

  return (
    <section className="relative min-h-[88vh] flex flex-col items-center justify-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/home-images/hero.png'), linear-gradient(135deg, #080e1c 0%, #1C2B4A 60%, #0d0d0d 100%)`,
          backgroundBlendMode: 'multiply',
        }}
      />
      {/* Overlay gradients */}
      <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/80" />
      <div className="absolute inset-0 bg-linear-to-r from-black/30 via-transparent to-black/30" />

      {/* Gold accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#C4A24D]/60 to-transparent" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-10 max-w-4xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-[#C4A24D]/30 bg-[#C4A24D]/8 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C4A24D] animate-pulse" />
          <span className="text-[#C4A24D] text-xs font-medium tracking-wide">{t('trusted')}</span>
        </div>

        <h1
          ref={headlineRef}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
        >
          {t('title')}
        </h1>

        <p
          ref={subRef}
          className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto mb-10"
        >
          {t('subtitle')}
        </p>

        <div ref={ctaRef} className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-[#C4A24D] hover:bg-[#D4B86A] text-black font-bold text-base transition-all duration-300 shadow-xl shadow-[#C4A24D]/25 hover:shadow-[#C4A24D]/40 hover:scale-105"
          >
            {t('cta')}
            <Arrow size={18} className="transition-transform group-hover:translate-x-1 group-rtl:group-hover:-translate-x-1" />
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/25 text-white hover:border-white/50 hover:bg-white/8 font-medium text-base transition-all duration-300"
          >
            {useTranslations('nav')('about')}
          </Link>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full text-background">
          <path d="M0 60L60 50C120 40 240 20 360 16.7C480 13 600 27 720 33.3C840 40 960 40 1080 33.3C1200 27 1320 13 1380 6.7L1440 0V60H0Z" fill="currentColor" />
        </svg>
      </div>
    </section>
  );
}
