import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { LayoutDashboard, FileText, MessageSquare, LogOut } from 'lucide-react';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const navItems = [
    { href: `/${locale}/admin`, label: 'داشبورد', icon: LayoutDashboard },
    { href: `/${locale}/admin/posts`, label: 'مقالات', icon: FileText },
    { href: `/${locale}/admin/contacts`, label: 'پیام‌ها', icon: MessageSquare },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-e border-border flex flex-col py-6 px-4 gap-2">
        <div className="px-3 mb-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">پنل مدیریت</p>
          <p className="font-bold text-foreground text-sm">دفتر حقوقی آرمان</p>
        </div>

        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground/80 hover:bg-[#C4A24D]/8 hover:text-[#C4A24D] transition-all"
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}

        <div className="mt-auto">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-destructive transition-colors w-full">
            <LogOut size={16} />
            خروج
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
