'use client';
import { useState, type FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Lock, Mail, LogIn } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'fa';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'ورود ناموفق بود');
        return;
      }
      router.push(`/${locale}/admin`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-2xl">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#C4A24D]/10 border border-[#C4A24D]/30 flex items-center justify-center">
            <Lock size={22} className="text-[#C4A24D]" />
          </div>
          <h1 className="text-xl font-bold text-foreground">ورود به پنل مدیریت</h1>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">ایمیل</label>
            <div className="relative">
              <Mail size={16} className="absolute top-1/2 -translate-y-1/2 inset-s-3 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full ps-9 pe-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-[#C4A24D]/60 transition-colors"
                dir="ltr"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">رمز عبور</label>
            <div className="relative">
              <Lock size={16} className="absolute top-1/2 -translate-y-1/2 inset-s-3 text-muted-foreground" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full ps-9 pe-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-[#C4A24D]/60 transition-colors"
                dir="ltr"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#C4A24D] hover:bg-[#D4B86A] text-black font-bold text-sm transition-colors disabled:opacity-60"
          >
            {loading ? (
              <span className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
            ) : (
              <>
                <LogIn size={16} />
                ورود
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
