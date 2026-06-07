'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { Menu, X, Phone } from 'lucide-react';

export function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navSticky, setNavSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => setNavSticky(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/about', label: t('about') },
    { href: '/services', label: t('services') },
    { href: '/blog', label: t('blog') },
    { href: '/contact', label: t('contact') },
  ];

  return (
    <>
      {/* ── Top header ── */}
      <header className="w-full z-50 px-4 sm:px-6 lg:px-10 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: language + theme + CTA */}
          <div className={`flex items-center gap-2 ${locale !== 'en' ? 'order-first' : 'order-last'}`}>
            <LanguageSwitcher />
            <ThemeToggle />
            <Link
              href="/contact"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 hover:border-[#C4A24D]/60 text-sm transition-all duration-300"
            >
              <Phone size={13} />
              <span>{t('contact')}</span>
            </Link>
            <Link
              href="/contact"
              className="hidden md:flex items-center px-4 py-1.5 rounded-full bg-[#C4A24D] hover:bg-[#D4B86A] text-black text-sm font-semibold transition-all duration-300 shadow-lg shadow-[#C4A24D]/20"
            >
              {t('consultation')}
            </Link>
          </div>

          {/* Right: logo + name */}
          <div className={`flex items-center gap-3 ${locale !== 'en' ? 'order-last' : 'order-first'}`}>
            <div className="flex flex-col items-end leading-tight">
              <span className="text-sm font-semibold text-foreground hidden sm:block">دفتر حقوقی آرمان</span>
            </div>
            <div className="w-10 h-10 relative">
              <Image src="/home-images/logo.png" alt="Armaan Legal" fill className="object-contain" priority />
            </div>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-full border border-white/15"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* ── Floating pill nav ── */}
      <div
        className={`hidden md:block w-full z-50 px-4 sm:px-6 lg:px-10 transition-all duration-500 ${
          navSticky
            ? 'fixed top-0 py-2'
            : 'relative -mt-2 py-0'
        }`}
      >
        <nav
          className={`max-w-3xl mx-auto flex items-center justify-center gap-1 px-6 py-3 rounded-full transition-all duration-500 ${
            navSticky
              ? 'bg-background/90 backdrop-blur-xl border border-white/10 shadow-2xl'
              : 'bg-white/95 dark:bg-white/10 backdrop-blur-md border border-black/5 dark:border-white/8 shadow-lg'
          }`}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-1.5 rounded-full text-sm text-foreground/80 hover:text-[#C4A24D] hover:bg-[#C4A24D]/8 transition-all duration-200 whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex flex-col pt-20 md:hidden">
          <div className="absolute inset-0 bg-background/95 backdrop-blur-xl" onClick={() => setMobileOpen(false)} />
          <nav className="relative z-10 flex flex-col items-center gap-2 py-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-8 py-3 text-lg text-foreground hover:text-[#C4A24D] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="mt-4 px-8 py-3 rounded-full bg-[#C4A24D] text-black font-semibold"
            >
              {t('consultation')}
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
