'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RichEditor } from './RichEditor';

const LOCALES = [
  { code: 'fa', label: 'فارسی', dir: 'rtl' as const },
  { code: 'en', label: 'English', dir: 'ltr' as const },
  { code: 'ar', label: 'العربية', dir: 'rtl' as const },
];

type LocaleContent = { title: string; excerpt: string; content: string };
type AllContent = Record<string, LocaleContent>;

export type PostFormProps = {
  /** When provided the form sends PUT /api/posts/[postId] instead of POST */
  postId?: number;
  initialSlug?: string;
  initialCategory?: string;
  initialPublished?: boolean;
  initialTranslations?: Partial<AllContent>;
};

const emptyContent = (): LocaleContent => ({ title: '', excerpt: '', content: '' });

export function PostForm({
  postId,
  initialSlug = '',
  initialCategory = 'blog',
  initialPublished = false,
  initialTranslations = {},
}: PostFormProps) {
  const router = useRouter();
  const isEdit = postId !== undefined;

  const [activeLocale, setActiveLocale] = useState('fa');
  const [slug, setSlug] = useState(initialSlug);
  const [category, setCategory] = useState(initialCategory);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [content, setContent] = useState<AllContent>(() =>
    Object.fromEntries(
      LOCALES.map((l) => [
        l.code,
        initialTranslations[l.code] ?? emptyContent(),
      ])
    )
  );

  function updateField(locale: string, field: keyof LocaleContent, value: string) {
    setContent((prev) => ({
      ...prev,
      [locale]: { ...prev[locale], [field]: value },
    }));
  }

  // Auto-generate slug from Persian title (create mode only)
  function handleFaTitle(value: string) {
    updateField('fa', 'title', value);
    if (!isEdit && slug === '') {
      setSlug(
        value
          .toLowerCase()
          .replace(/[؀-ۿ\s]+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 80) || ''
      );
    }
  }

  async function handleSave(published: boolean) {
    setError('');
    if (!slug.trim()) { setError('اسلاگ الزامی است'); return; }
    const hasAnyTitle = LOCALES.some((l) => content[l.code].title.trim() !== '');
    if (!hasAnyTitle) { setError('حداقل عنوان یک زبان الزامی است'); return; }

    setLoading(true);
    try {
      const url = isEdit ? `/api/posts/${postId}` : '/api/posts';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, category, published, translations: content }),
      });

      if (res.status === 409) {
        setError('این اسلاگ قبلاً استفاده شده');
        return;
      }
      if (!res.ok) {
        setError('خطا در ذخیره‌سازی');
        return;
      }
      router.push('../../admin/posts');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const currentLocale = LOCALES.find((l) => l.code === activeLocale)!;
  const current = content[activeLocale];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Slug + Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 rounded-2xl border border-border bg-card">
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">اسلاگ (URL)</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="my-post-slug"
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-[#C4A24D]/60 transition-colors"
            dir="ltr"
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">دسته‌بندی</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-[#C4A24D]/60 transition-colors"
          >
            <option value="blog">بلاگ</option>
            <option value="news">اخبار</option>
            <option value="tutorial">آموزش</option>
            <option value="article">مقاله</option>
          </select>
        </div>
      </div>

      {/* Locale tabs */}
      <div className="flex gap-1 p-1 rounded-xl border border-border bg-card w-fit">
        {LOCALES.map((l) => {
          const filled = content[l.code].title.trim() !== '';
          return (
            <button
              key={l.code}
              onClick={() => setActiveLocale(l.code)}
              className={`relative px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeLocale === l.code
                  ? 'bg-[#C4A24D] text-black'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {l.label}
              {filled && activeLocale !== l.code && (
                <span className="absolute top-1.5 end-1.5 w-1.5 h-1.5 rounded-full bg-green-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Content for active locale */}
      <div
        className="space-y-4 p-6 rounded-2xl border border-border bg-card"
        dir={currentLocale.dir}
      >
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">عنوان</label>
          <input
            value={current.title}
            onChange={(e) =>
              activeLocale === 'fa'
                ? handleFaTitle(e.target.value)
                : updateField(activeLocale, 'title', e.target.value)
            }
            placeholder={currentLocale.dir === 'rtl' ? 'عنوان مطلب' : 'Post title'}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-[#C4A24D]/60 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">خلاصه</label>
          <textarea
            value={current.excerpt}
            onChange={(e) => updateField(activeLocale, 'excerpt', e.target.value)}
            rows={3}
            placeholder={currentLocale.dir === 'rtl' ? 'خلاصه کوتاه...' : 'Short excerpt...'}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-[#C4A24D]/60 resize-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">محتوا</label>
          <RichEditor
            key={activeLocale}
            dir={currentLocale.dir}
            initialHtml={current.content}
            onChange={(html) => updateField(activeLocale, 'content', html)}
            placeholder={currentLocale.dir === 'rtl' ? 'محتوای خود را اینجا بنویسید...' : 'Write your content here...'}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <button
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
        >
          انصراف
        </button>
        <button
          onClick={() => handleSave(false)}
          disabled={loading}
          className="px-6 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
        >
          ذخیره پیش‌نویس
        </button>
        <button
          onClick={() => handleSave(true)}
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-[#C4A24D] hover:bg-[#D4B86A] text-black text-sm font-bold transition-colors disabled:opacity-50"
        >
          {loading ? 'در حال ذخیره...' : isEdit ? 'ذخیره تغییرات' : 'انتشار'}
        </button>
      </div>
    </div>
  );
}
