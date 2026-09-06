'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, FileText, MessageSquare, ClipboardList, LogOut } from 'lucide-react';

export function AdminSidebar({ locale }: { locale: string }) {
  const router = useRouter();

  const navItems = [
    { href: `/${locale}/admin`, label: 'داشبورد', icon: LayoutDashboard },
    { href: `/${locale}/admin/posts`, label: 'مقالات', icon: FileText },
    { href: `/${locale}/admin/contacts`, label: 'پیام‌ها', icon: MessageSquare },
    { href: `/${locale}/admin/consultations`, label: 'درخواست‌های مشاوره', icon: ClipboardList },
  ];

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push(`/${locale}/admin/login`);
    router.refresh();
  }

  return (
    <aside className="w-60 shrink-0 border-e border-border flex flex-col py-6 px-4 gap-2">
      <div className="px-3 mb-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">پنل مدیریت</p>
        <p className="font-bold text-foreground text-sm">کارگزاران سرآمد آرمان</p>
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
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-destructive transition-colors w-full"
        >
          <LogOut size={16} />
          خروج
        </button>
      </div>
    </aside>
  );
}
