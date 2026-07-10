'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const t = useTranslations('nav');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navSticky, setNavSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => setNavSticky(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

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
      {/* sticky on mobile so hamburger stays accessible; static on desktop (pill nav takes over) */}
      <header
        className={`sticky top-0 md:static w-full z-100 px-4 sm:px-6 lg:px-10 py-3 transition-all duration-300 ${
          navSticky ? 'md:bg-transparent' : ''
        } bg-background/95 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none border-b border-border/60 md:border-transparent`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo + name */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 relative">
              <Image
                src="/home-images/logo.png"
                alt="Armaan Legal"
                fill
                sizes="40px"
                className="object-contain"
                priority
              />
            </div>
            <span className="text-sm font-semibold text-foreground hidden sm:block">دفتر حقوقی آرمان</span>
          </Link>

          {/* Desktop controls */}
          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link
              href="/consultation"
              className="ms-2 inline-flex items-center px-4 py-1.5 rounded-full bg-[#C4A24D] hover:bg-[#D4B86A] text-black text-sm font-semibold transition-all duration-300 shadow-lg shadow-[#C4A24D]/20"
            >
              {t('consultation')}
            </Link>
          </div>

          {/* Mobile controls */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            <ThemeToggle />
            <button
              className="w-9 h-9 flex items-center justify-center rounded-full border border-white/15 hover:border-[#C4A24D]/40 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Floating pill nav (desktop only) ── */}
      <div
        className={`hidden md:block w-full z-50 px-4 sm:px-6 lg:px-10 transition-all duration-500 ${
          navSticky ? 'fixed top-0 py-2' : 'relative -mt-2 py-0'
        }`}
      >
        <nav
          className={`max-w-3xl mx-auto flex items-center justify-center gap-1 px-6 py-3 rounded-full transition-all duration-500 ${
            navSticky
              ? 'bg-background/95 backdrop-blur-xl border border-border/70 shadow-2xl'
              : 'bg-white/95 dark:bg-[#1C2B4A]/80 backdrop-blur-md border border-black/8 dark:border-white/15 shadow-lg'
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

      {/* ── Mobile menu overlay ── */}
      <div
        className={`fixed inset-0 z-90 md:hidden transition-all duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-background/95 backdrop-blur-xl" onClick={() => setMobileOpen(false)} />
        <nav
          className={`relative z-10 flex flex-col items-center justify-center h-full gap-2 transition-all duration-300 ${
            mobileOpen ? 'translate-y-0' : '-translate-y-4'
          }`}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="px-8 py-3 text-xl text-foreground hover:text-[#C4A24D] transition-colors font-medium"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/consultation"
            onClick={() => setMobileOpen(false)}
            className="mt-6 px-10 py-3.5 rounded-full bg-[#C4A24D] hover:bg-[#D4B86A] text-black font-bold text-base transition-all duration-300"
          >
            {t('consultation')}
          </Link>
        </nav>
      </div>
    </>
  );
}
