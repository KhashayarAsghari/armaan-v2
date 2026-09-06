'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowLeft, ArrowRight, Megaphone, Presentation } from 'lucide-react';
import { useLocale } from 'next-intl';
import type { PostSummary } from '@/lib/posts';

export function Announcements({ posts }: { posts: PostSummary[] }) {
  const t = useTranslations('announcements');
  const locale = useLocale();
  const Arrow = locale === 'en' ? ArrowRight : ArrowLeft;

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-10 bg-background/60">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 rounded-3xl border border-white/8 bg-card p-7 sm:p-8">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#C4A24D]/30 bg-[#C4A24D]/10 text-[#C4A24D] mb-4">
            <Megaphone size={18} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-5">{t('title')}</h2>
          {posts.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('empty')}</p>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="block rounded-xl border border-white/8 bg-background/70 px-4 py-3 text-sm text-foreground hover:border-[#C4A24D]/30 transition-colors"
                >
                  {post.title}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-7 rounded-3xl border border-white/8 bg-[#1C2B4A] p-7 sm:p-8 text-white">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#C4A24D]/30 bg-[#C4A24D]/15 text-[#D4B86A] mb-4">
            <Presentation size={18} />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold mb-4">{t('seminarsTitle')}</h3>
          <p className="text-white/75 leading-8 mb-6">{t('seminarsDesc')}</p>
          <Link
            href="/tutorials"
            className="inline-flex items-center gap-2 rounded-full bg-[#C4A24D] hover:bg-[#D4B86A] px-6 py-3 text-sm font-bold text-black transition-colors"
          >
            {t('seminarsCta')}
            <Arrow size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
