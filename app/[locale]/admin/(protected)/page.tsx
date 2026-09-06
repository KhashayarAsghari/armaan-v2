import { setRequestLocale } from 'next-intl/server';
import { FileText, MessageSquare, ClipboardList } from 'lucide-react';
import { db } from '@/lib/db';
import { posts, contacts, consultationRequests } from '@/lib/schema';
import { count, eq } from 'drizzle-orm';

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [[publishedPosts], [unreadContacts], [unreadConsultations]] = await Promise.all([
    db.select({ value: count() }).from(posts).where(eq(posts.published, true)),
    db.select({ value: count() }).from(contacts).where(eq(contacts.read, false)),
    db.select({ value: count() }).from(consultationRequests).where(eq(consultationRequests.read, false)),
  ]);

  const cards = [
    { icon: FileText, label: 'مقالات منتشر شده', value: String(publishedPosts?.value ?? 0) },
    { icon: MessageSquare, label: 'پیام‌های خوانده‌نشده', value: String(unreadContacts?.value ?? 0) },
    { icon: ClipboardList, label: 'درخواست‌های مشاوره خوانده‌نشده', value: String(unreadConsultations?.value ?? 0) },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-foreground mb-8">داشبورد</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
        {cards.map(({ icon: Icon, label, value }, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#C4A24D]/10">
                <Icon size={16} className="text-[#C4A24D]" />
              </div>
              <span className="text-sm text-muted-foreground">{label}</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          برای ایجاد مقاله جدید از منوی سمت چپ اقدام کنید.
        </p>
      </div>
    </div>
  );
}
