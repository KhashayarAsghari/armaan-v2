import { setRequestLocale } from 'next-intl/server';
import { FileText, MessageSquare, Eye } from 'lucide-react';

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const cards = [
    { icon: FileText, label: 'مقالات منتشر شده', value: '—' },
    { icon: MessageSquare, label: 'پیام‌های دریافتی', value: '—' },
    { icon: Eye, label: 'بازدید این ماه', value: '—' },
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
          پنل مدیریت در حال توسعه است. برای ایجاد مقاله جدید از منوی سمت چپ اقدام کنید.
        </p>
      </div>
    </div>
  );
}
