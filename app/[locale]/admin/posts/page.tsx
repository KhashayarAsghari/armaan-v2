'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Globe, FileText } from 'lucide-react';

type Post = {
  id: number;
  slug: string;
  category: string;
  published: boolean;
  createdAt: string;
  faTitle: string | null;
};

const categoryLabel: Record<string, string> = {
  blog: 'بلاگ',
  news: 'اخبار',
  tutorial: 'آموزش',
  article: 'مقاله',
};

const categoryColor: Record<string, string> = {
  blog: 'bg-blue-500/15 text-blue-400',
  news: 'bg-purple-500/15 text-purple-400',
  tutorial: 'bg-green-500/15 text-green-400',
  article: 'bg-orange-500/15 text-orange-400',
};

export default function AdminPostsPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'fa';
  const router = useRouter();

  const [postsList, setPostsList] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/posts');
    if (res.ok) setPostsList(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function deletePost(id: number, title: string | null) {
    if (!confirm(`«${title ?? id}» حذف شود؟`)) return;
    await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    setPostsList((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-foreground">مقالات</h1>
        <Link
          href={`/${locale}/admin/posts/new`}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C4A24D] hover:bg-[#D4B86A] text-black font-semibold text-sm transition-colors"
        >
          <Plus size={16} />
          مقاله جدید
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground text-sm">
          در حال بارگذاری...
        </div>
      ) : postsList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
          <FileText size={36} className="opacity-30" />
          <p className="text-sm">هنوز مقاله‌ای ثبت نشده</p>
          <Link
            href={`/${locale}/admin/posts/new`}
            className="text-sm text-[#C4A24D] hover:underline"
          >
            اولین مقاله را بنویسید
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-start px-5 py-3 text-xs text-muted-foreground font-medium">عنوان</th>
                <th className="text-start px-4 py-3 text-xs text-muted-foreground font-medium hidden sm:table-cell">اسلاگ</th>
                <th className="text-start px-4 py-3 text-xs text-muted-foreground font-medium">دسته</th>
                <th className="text-start px-4 py-3 text-xs text-muted-foreground font-medium">وضعیت</th>
                <th className="text-start px-4 py-3 text-xs text-muted-foreground font-medium hidden md:table-cell">تاریخ</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {postsList.map((post) => (
                <tr key={post.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="font-medium text-foreground line-clamp-1">
                      {post.faTitle ?? <span className="text-muted-foreground italic">بدون عنوان</span>}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <span className="text-muted-foreground font-mono text-xs flex items-center gap-1">
                      <Globe size={11} />
                      {post.slug}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${categoryColor[post.category] ?? 'bg-muted text-muted-foreground'}`}>
                      {categoryLabel[post.category] ?? post.category}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                      post.published
                        ? 'bg-green-500/15 text-green-400'
                        : 'bg-yellow-500/15 text-yellow-400'
                    }`}>
                      {post.published ? 'منتشر' : 'پیش‌نویس'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell text-muted-foreground text-xs">
                    {new Date(post.createdAt).toLocaleDateString('fa-IR')}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => router.push(`/${locale}/admin/posts/${post.id}`)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#C4A24D]/15 hover:text-[#C4A24D] text-muted-foreground transition-colors"
                        title="ویرایش"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => deletePost(post.id, post.faTitle)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/15 hover:text-red-400 text-muted-foreground transition-colors"
                        title="حذف"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
