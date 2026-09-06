'use client';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Phone, Mail, MapPin, Send, Rss, MessageCircle } from 'lucide-react';
import { siteConfig } from '@/lib/config';

export function Footer() {
  const t = useTranslations();
  const locale = useLocale() as 'fa' | 'en' | 'ar';

  return (
    <footer className="border-t border-white/8 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 relative">
                <Image src="/logo.svg" alt="Armaan Legal" fill className="object-contain" />
              </div>
              <div>
                <p className="font-bold text-foreground">{siteConfig.companyName[locale]}</p>
                <p className="text-xs text-muted-foreground">{t('footer.tagline')}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              {t('contact.subtitle')}
            </p>
            <div className="flex items-center gap-3 mt-2">
              {[
                { icon: Send, href: siteConfig.social.telegram },
                { icon: Rss, href: siteConfig.social.instagram },
                { icon: MessageCircle, href: siteConfig.social.facebook },
              ]
                .filter((s) => s.href)
                .map(({ icon: Icon, href }, i) => (
                  <a
                    key={i}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-white/12 hover:border-[#C4A24D]/60 hover:bg-[#C4A24D]/10 text-muted-foreground hover:text-[#C4A24D] transition-all duration-300"
                  >
                    <Icon size={15} />
                  </a>
                ))}
            </div>
          </div>

          {/* Nav links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-[#C4A24D] uppercase tracking-wider mb-1">
              {t('nav.home')}
            </h4>
            {[
              { href: '/about', label: t('nav.about') },
              { href: '/#services', label: t('nav.services') },
              { href: '/blog', label: t('nav.blog') },
              { href: '/contact', label: t('nav.contact') },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-[#C4A24D] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Contact info */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-semibold text-[#C4A24D] uppercase tracking-wider mb-1">
              {t('nav.contact')}
            </h4>
            {[
              { icon: MapPin, text: siteConfig.address },
              { icon: Phone, text: siteConfig.phone },
              { icon: Mail, text: siteConfig.email },
            ].filter((c) => c.text).map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <Icon size={15} className="text-[#C4A24D] mt-0.5 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-14 pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {siteConfig.companyName[locale]}. {t('footer.rights')}.</p>
          <div className="gold-divider w-20" />
        </div>
      </div>
    </footer>
  );
}
