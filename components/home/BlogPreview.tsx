'use client';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowLeft, ArrowRight, Calendar, Newspaper } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { PostSummary } from '@/lib/posts';

function formatDate(date: Date | null, locale: string) {
  if (!date) return '';
  const localeTag = locale === 'en' ? 'en-US' : locale === 'ar' ? 'ar-SA' : 'fa-IR';
  return new Date(date).toLocaleDateString(localeTag);
}

export function BlogPreview({ posts }: { posts: PostSummary[] }) {
  const t = useTranslations('blog');
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
    cards.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, [posts]);

  return (
    <section ref={sectionRef} className="py-24 px-4 sm:px-6 lg:px-10 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="w-8 h-0.5 bg-[#C4A24D] mb-4" />
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">{t('title')}</h2>
          </div>
          {posts.length > 0 && (
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#C4A24D]/40 text-[#C4A24D] hover:bg-[#C4A24D] hover:text-black text-sm font-medium transition-all duration-300"
            >
              {t('viewAll')}
              <Arrow size={14} />
            </Link>
          )}
        </div>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 rounded-3xl border border-dashed border-white/10 text-muted-foreground gap-3">
            <Newspaper size={32} className="opacity-40" />
            <p className="text-sm">{t('empty')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                data-card
                data-delay={i * 100}
                className="reveal group rounded-3xl overflow-hidden border border-white/6 bg-card hover:border-[#C4A24D]/30 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/30 transition-all duration-400"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-[#1C2B4A]">
                  <div
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                    style={{
                      backgroundImage:
                        i % 3 === 0
                          ? 'linear-gradient(135deg, #1C2B4A, #0d0d0d)'
                          : i % 3 === 1
                            ? 'linear-gradient(135deg, #13233f, #0f172a)'
                            : 'linear-gradient(135deg, #2d1f0f, #0f172a)',
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Calendar size={12} />
                    <span>{formatDate(post.publishedAt, locale)}</span>
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-3 line-clamp-2 group-hover:text-[#C4A24D] transition-colors duration-300">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="mt-5 flex items-center gap-1.5 text-sm text-[#C4A24D] font-medium">
                    {t('readMore')}
                    <Arrow size={13} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
