'use client';
import { useState } from 'react';
import { RichEditor } from './RichEditor';
import { useRouter } from 'next/navigation';

const LOCALES = [
  { code: 'fa', label: 'فارسی', dir: 'rtl' as const },
  { code: 'en', label: 'English', dir: 'ltr' as const },
  { code: 'ar', label: 'العربية', dir: 'rtl' as const },
];

type LocaleContent = { title: string; excerpt: string; content: string };
type AllContent = Record<string, LocaleContent>;

export function NewPostForm() {
  const router = useRouter();
  const [activeLocale, setActiveLocale] = useState('fa');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('blog');
  const [loading, setLoading] = useState(false);

  const [content, setContent] = useState<AllContent>(() =>
    Object.fromEntries(LOCALES.map((l) => [l.code, { title: '', excerpt: '', content: '' }]))
  );

  function updateField(locale: string, field: keyof LocaleContent, value: string) {
    setContent((prev) => ({
      ...prev,
      [locale]: { ...prev[locale], [field]: value },
    }));
  }

  async function handleSave(published: boolean) {
    setLoading(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, category, published, translations: content }),
      });
      if (res.ok) router.push('../posts');
    } finally {
      setLoading(false);
    }
  }

  const current = content[activeLocale];
  const currentLocale = LOCALES.find((l) => l.code === activeLocale)!;

  return (
    <div className="space-y-6">
      {/* Meta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 rounded-2xl border border-border bg-card">
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">اسلاگ (URL)</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="my-post-slug"
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-[#C4A24D]/60"
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">دسته‌بندی</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-[#C4A24D]/60"
          >
            <option value="blog">بلاگ</option>
            <option value="article">مقاله</option>
            <option value="news">اخبار</option>
            <option value="tutorial">آموزش</option>
          </select>
        </div>
      </div>

      {/* Language tabs */}
      <div className="flex gap-1 p-1 rounded-xl border border-border bg-card w-fit">
        {LOCALES.map((l) => (
          <button
            key={l.code}
            onClick={() => setActiveLocale(l.code)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeLocale === l.code
                ? 'bg-[#C4A24D] text-black'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* Content for active locale */}
      <div className="space-y-4 p-6 rounded-2xl border border-border bg-card" dir={currentLocale.dir}>
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">عنوان</label>
          <input
            value={current.title}
            onChange={(e) => updateField(activeLocale, 'title', e.target.value)}
            placeholder="عنوان مقاله"
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-[#C4A24D]/60"
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">خلاصه</label>
          <textarea
            value={current.excerpt}
            onChange={(e) => updateField(activeLocale, 'excerpt', e.target.value)}
            rows={3}
            placeholder="خلاصه کوتاه"
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-[#C4A24D]/60 resize-none"
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">محتوا</label>
          <RichEditor
            key={activeLocale}
            dir={currentLocale.dir}
            onChange={(html) => updateField(activeLocale, 'content', html)}
            placeholder={currentLocale.dir === 'rtl' ? 'محتوای خود را اینجا بنویسید...' : 'Write your content here...'}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
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
          {loading ? 'در حال انتشار...' : 'انتشار'}
        </button>
      </div>
    </div>
  );
}
