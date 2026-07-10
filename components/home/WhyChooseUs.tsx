'use client';

import { useTranslations } from 'next-intl';
import { BadgeCheck, Gavel, Handshake, Shield } from 'lucide-react';

const items = [
  { key: 'r1', icon: Gavel },
  { key: 'r2', icon: Shield },
  { key: 'r3', icon: BadgeCheck },
  { key: 'r4', icon: Handshake },
];

export function WhyChooseUs() {
  const t = useTranslations('whyChoose');

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-10 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <div className="gold-divider mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">{t('title')}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map(({ key, icon: Icon }) => (
            <div
              key={key}
              className="rounded-3xl border border-white/8 bg-card p-7 hover:border-[#C4A24D]/30 transition-colors"
            >
              <div className="w-11 h-11 mb-5 flex items-center justify-center rounded-xl border border-[#C4A24D]/25 bg-[#C4A24D]/10">
                <Icon size={20} className="text-[#C4A24D]" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3">{t(`${key}Title`)}</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-8">{t(`${key}Desc`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
