import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function AdminPostsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="p-8">
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

      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground text-center py-8">
          هنوز مقاله‌ای ثبت نشده است.
        </p>
      </div>
    </div>
  );
}
