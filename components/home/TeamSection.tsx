'use client';

import { useTranslations } from 'next-intl';
import { UserRound } from 'lucide-react';

export function TeamSection() {
  const t = useTranslations('team');

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-10 bg-background/60">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <div className="gold-divider mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{t('title')}</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">{t('subtitle')}</p>
        </div>

        <div className="rounded-3xl border border-white/8 bg-[#1C2B4A] p-7 sm:p-9 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-3 flex justify-center">
              <div className="w-40 h-40 rounded-3xl border border-[#C4A24D]/35 bg-[#0f172a] flex items-center justify-center">
                <UserRound size={46} className="text-[#D4B86A]" />
              </div>
            </div>
            <div className="lg:col-span-9">
              <h3 className="text-xl sm:text-2xl font-bold mb-4">{t('ceoTitle')}</h3>
              <p className="text-white/80 leading-8 mb-5">&ldquo;{t('ceoQuote')}&rdquo;</p>
              <p className="text-[#D4B86A] font-semibold">{t('ceoName')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
