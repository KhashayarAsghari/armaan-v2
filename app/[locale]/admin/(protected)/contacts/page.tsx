'use client';
import { useEffect, useState } from 'react';
import { Mail, Phone, Trash2, CheckCheck, Clock } from 'lucide-react';

type Contact = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  read: boolean;
  createdAt: string;
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  async function load() {
    const res = await fetch('/api/contacts');
    if (res.ok) setContacts(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function markRead(id: number, read: boolean) {
    await fetch(`/api/contacts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read }),
    });
    setContacts((prev) => prev.map((c) => c.id === id ? { ...c, read } : c));
  }

  async function remove(id: number) {
    if (!confirm('این پیام حذف شود؟')) return;
    await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }

  const unread = contacts.filter((c) => !c.read).length;

  return (
    <div className="p-6 sm:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">درخواست‌های مشاوره</h1>
          {unread > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              <span className="text-[#C4A24D] font-semibold">{unread}</span> پیام خوانده‌نشده
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground text-sm">
          در حال بارگذاری...
        </div>
      ) : contacts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
          <Mail size={36} className="opacity-30" />
          <p className="text-sm">هیچ پیامی دریافت نشده</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {contacts.map((c) => (
            <div
              key={c.id}
              className={`rounded-2xl border transition-all duration-200 ${
                c.read
                  ? 'border-border bg-card'
                  : 'border-[#C4A24D]/30 bg-[#C4A24D]/4'
              }`}
            >
              {/* Row */}
              <button
                className="w-full text-start px-5 py-4 flex items-center gap-4"
                onClick={() => {
                  setExpanded(expanded === c.id ? null : c.id);
                  if (!c.read) markRead(c.id, true);
                }}
              >
                {/* Unread dot */}
                <span className={`w-2 h-2 rounded-full shrink-0 ${c.read ? 'bg-transparent' : 'bg-[#C4A24D]'}`} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-semibold text-sm text-foreground">{c.name}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail size={11} /> {c.email}
                    </span>
                    {c.phone && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone size={11} /> {c.phone}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">{c.message}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={11} />
                    {new Date(c.createdAt).toLocaleDateString('fa-IR')}
                  </span>
                </div>
              </button>

              {/* Expanded */}
              {expanded === c.id && (
                <div className="px-5 pb-5 border-t border-border/50 pt-4">
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap mb-4">
                    {c.message}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => markRead(c.id, !c.read)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-border hover:border-[#C4A24D]/40 hover:text-[#C4A24D] transition-colors text-muted-foreground"
                    >
                      <CheckCheck size={13} />
                      {c.read ? 'علامت‌گذاری به عنوان خوانده‌نشده' : 'علامت‌گذاری به عنوان خوانده‌شده'}
                    </button>
                    <button
                      onClick={() => remove(c.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-border hover:border-red-500/40 hover:text-red-400 transition-colors text-muted-foreground"
                    >
                      <Trash2 size={13} />
                      حذف
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
