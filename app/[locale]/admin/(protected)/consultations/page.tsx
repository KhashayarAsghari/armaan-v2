'use client';
import { useEffect, useState } from 'react';
import { Mail, Phone, Building2, MapPin, Trash2, CheckCheck, Clock, ClipboardList, Paperclip } from 'lucide-react';

type UploadedFile = { name: string; url: string; size: number; type: string };

type ConsultationRequest = {
  id: number;
  locale: string;
  serviceType: string;
  subject: string;
  fullName: string;
  companyName: string | null;
  phone: string;
  email: string;
  city: string;
  responseMethods: string;
  uploadLink: string | null;
  uploadedFiles: string | null;
  read: boolean;
  createdAt: string;
};

const serviceLabel: Record<string, string> = {
  customsBrokerage: 'کارگزاری گمرکی',
  tradeConsulting: 'مشاوره بازرگانی',
  legalConsulting: 'مشاوره حقوقی',
  transportServices: 'خدمات حمل و نقل',
  specializedTraining: 'آموزش تخصصی',
};

export default function AdminConsultationsPage() {
  const [items, setItems] = useState<ConsultationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  async function load() {
    const res = await fetch('/api/consultations');
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function markRead(id: number, read: boolean) {
    await fetch(`/api/consultations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read }),
    });
    setItems((prev) => prev.map((c) => c.id === id ? { ...c, read } : c));
  }

  async function remove(id: number) {
    if (!confirm('این درخواست حذف شود؟')) return;
    await fetch(`/api/consultations/${id}`, { method: 'DELETE' });
    setItems((prev) => prev.filter((c) => c.id !== id));
  }

  const unread = items.filter((c) => !c.read).length;

  return (
    <div className="p-6 sm:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">درخواست‌های مشاوره</h1>
          {unread > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              <span className="text-[#C4A24D] font-semibold">{unread}</span> درخواست خوانده‌نشده
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground text-sm">در حال بارگذاری...</div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
          <ClipboardList size={36} className="opacity-30" />
          <p className="text-sm">هیچ درخواستی ثبت نشده</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((c) => {
            let files: UploadedFile[] = [];
            try { files = c.uploadedFiles ? JSON.parse(c.uploadedFiles) : []; } catch { /* ignore malformed */ }
            let methods: string[] = [];
            try { methods = c.responseMethods ? JSON.parse(c.responseMethods) : []; } catch { /* ignore malformed */ }

            return (
              <div
                key={c.id}
                className={`rounded-2xl border transition-all duration-200 ${
                  c.read ? 'border-border bg-card' : 'border-[#C4A24D]/30 bg-[#C4A24D]/4'
                }`}
              >
                <button
                  className="w-full text-start px-5 py-4 flex items-center gap-4"
                  onClick={() => {
                    setExpanded(expanded === c.id ? null : c.id);
                    if (!c.read) markRead(c.id, true);
                  }}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${c.read ? 'bg-transparent' : 'bg-[#C4A24D]'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-semibold text-sm text-foreground">{c.fullName}</span>
                      <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-[#C4A24D]/15 text-[#C4A24D]">
                        {serviceLabel[c.serviceType] ?? c.serviceType}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{c.subject}</p>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <Clock size={11} />
                    {new Date(c.createdAt).toLocaleDateString('fa-IR')}
                  </span>
                </button>

                {expanded === c.id && (
                  <div className="px-5 pb-5 border-t border-border/50 pt-4 space-y-3">
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{c.subject}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Phone size={12} /> {c.phone}</span>
                      <span className="flex items-center gap-1.5"><Mail size={12} /> {c.email}</span>
                      <span className="flex items-center gap-1.5"><MapPin size={12} /> {c.city}</span>
                      {c.companyName && (
                        <span className="flex items-center gap-1.5"><Building2 size={12} /> {c.companyName}</span>
                      )}
                    </div>
                    {methods.length > 0 && (
                      <p className="text-xs text-muted-foreground">روش پاسخ: {methods.join('، ')}</p>
                    )}
                    {(files.length > 0 || c.uploadLink) && (
                      <div className="space-y-1.5">
                        {files.map((f) => (
                          <a
                            key={f.url}
                            href={f.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-xs text-[#C4A24D] hover:underline"
                          >
                            <Paperclip size={12} /> {f.name}
                          </a>
                        ))}
                        {c.uploadLink && (
                          <a href={c.uploadLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-[#C4A24D] hover:underline">
                            <Paperclip size={12} /> {c.uploadLink}
                          </a>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-1">
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
            );
          })}
        </div>
      )}
    </div>
  );
}
