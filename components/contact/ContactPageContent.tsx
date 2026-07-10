'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CheckCircle2,
  ChevronDown,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Rss,
  Send,
  Smartphone,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email(),
  message: z.string().min(10),
});

type FormData = z.infer<typeof schema>;

const quickMenu = [
  { label: '091212345678', href: 'tel:091212345678', external: true },
  { label: 'مشاوره بگیرید...', href: '/consultation', external: false },
  { label: 'تماس با ما ...', href: '/contact#contact-form', external: false },
];

const contactDetails = [
  {
    label: 'آدرس',
    value: 'بجنورد، طالقانی شرقی، مجتمع تجاری آرمانی، طبقه اول، پلاک 41',
    icon: MapPin,
  },
  { label: 'تلفن', value: '05832721251', icon: Phone },
  { label: 'موبایل', value: '09123491879', icon: Smartphone },
  { label: 'ایمیل', value: 'info@armanco.com', icon: Mail },
];

const socials = [
  { label: 'اینستاگرام', value: 'arman', href: 'https://instagram.com/arman', icon: Rss },
  { label: 'لینکدین', value: 'arman', href: 'https://linkedin.com/in/arman', icon: Globe },
  { label: 'تلگرام', value: 'arman', href: 'https://t.me/arman', icon: Send },
  { label: 'فیس بوک', value: 'arman', href: 'https://facebook.com/arman', icon: MessageCircle },
];

export function ContactPageContent() {
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setSuccess(true);
      reset();
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-[#C4A24D]/60 focus:outline-none focus:ring-2 focus:ring-[#C4A24D]/10';

  return (
    <section className="bg-background px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <div className="flex justify-end">
          <div className="relative w-full max-w-xs">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="inline-flex w-full items-center justify-between rounded-full border border-[#C4A24D]/35 bg-[#C4A24D]/10 px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-[#C4A24D]/20"
            >
              منوی بازشو
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {menuOpen ? (
              <div className="absolute left-0 right-0 top-14 z-30 overflow-hidden rounded-2xl border border-white/10 bg-card shadow-2xl shadow-black/20">
                {quickMenu.map((item) =>
                  item.external ? (
                    <a
                      key={item.label}
                      href={item.href}
                      className="block border-b border-white/8 px-4 py-3 text-sm text-foreground transition-colors last:border-b-0 hover:bg-[#C4A24D]/10"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="block border-b border-white/8 px-4 py-3 text-sm text-foreground transition-colors last:border-b-0 hover:bg-[#C4A24D]/10"
                    >
                      {item.label}
                    </Link>
                  )
                )}
              </div>
            ) : null}
          </div>
        </div>

        <div className="text-center">
          <div className="gold-divider mb-6" />
          <h1 className="mb-3 text-3xl font-bold text-foreground sm:text-4xl">تماس با ما</h1>
          <p className="text-sm text-muted-foreground sm:text-base">ارسال پیام</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div id="contact-form" className="lg:col-span-7">
            <div className="rounded-3xl border border-white/8 bg-card p-6 shadow-2xl shadow-black/10 sm:p-8">
              {success ? (
                <div className="flex min-h-72 flex-col items-center justify-center gap-4 text-center">
                  <CheckCircle2 size={52} className="text-[#C4A24D]" />
                  <h2 className="text-xl font-bold text-foreground">پیام شما با موفقیت ارسال شد.</h2>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">نام :</label>
                    <input
                      {...register('name')}
                      className={`${inputClass} ${errors.name ? 'border-red-500/60' : ''}`}
                      placeholder="نام خود را وارد کنید"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                      شماره تماس:
                    </label>
                    <input
                      {...register('phone')}
                      className={`${inputClass} ${errors.phone ? 'border-red-500/60' : ''}`}
                      placeholder="شماره تماس خود را وارد کنید"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">ایمیل:</label>
                    <input
                      {...register('email')}
                      type="email"
                      className={`${inputClass} ${errors.email ? 'border-red-500/60' : ''}`}
                      placeholder="ایمیل خود را وارد کنید"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">متن پیام:</label>
                    <textarea
                      {...register('message')}
                      rows={5}
                      className={`${inputClass} resize-none ${errors.message ? 'border-red-500/60' : ''}`}
                      placeholder="پیام شما..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#C4A24D] px-5 py-3.5 text-sm font-bold text-black transition-all duration-300 hover:bg-[#D4B86A] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                    ) : (
                      <>
                        <Send size={16} />
                        دکمه ارسال
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div id="contact-info" className="space-y-6 lg:col-span-5">
            <div className="rounded-3xl border border-white/8 bg-card p-6 sm:p-7">
              <h2 className="mb-5 text-xl font-bold text-foreground">مشخصات تماس:</h2>
              <div className="space-y-4">
                {contactDetails.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#C4A24D]/35 bg-[#C4A24D]/10">
                      <Icon size={16} className="text-[#C4A24D]" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{label}:</p>
                      <p className="text-sm font-medium text-foreground">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/8 bg-card p-6 sm:p-7">
              <h3 className="mb-4 text-lg font-bold text-foreground">شبکه‌های اجتماعی</h3>
              <div className="space-y-3">
                {socials.map(({ label, value, href, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl border border-white/8 px-4 py-3 transition-colors hover:border-[#C4A24D]/35 hover:bg-[#C4A24D]/8"
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={16} className="text-[#C4A24D]" />
                      <span className="text-sm text-foreground">{label}:</span>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">{value}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/8 bg-card">
              <div className="flex items-center gap-2 border-b border-white/8 px-5 py-4">
                <MessageCircle size={17} className="text-[#C4A24D]" />
                <p className="text-sm font-semibold text-foreground">لوکیشن: نقشه گوگل مپ</p>
              </div>
              <iframe
                title="Arman Company Location"
                src="https://www.google.com/maps?q=%D8%A8%D8%AC%D9%86%D9%88%D8%B1%D8%AF%D8%8C%20%D8%B7%D8%A7%D9%84%D9%82%D8%A7%D9%86%DB%8C%20%D8%B4%D8%B1%D9%82%DB%8C%D8%8C%20%D9%85%D8%AC%D8%AA%D9%85%D8%B9%20%D8%AA%D8%AC%D8%A7%D8%B1%DB%8C%20%D8%A2%D8%B1%D9%85%D8%A7%D9%86%DB%8C%20%D8%B7%D8%A8%D9%82%D9%87%20%D8%A7%D9%88%D9%84%20%D9%BE%D9%84%D8%A7%DA%A9%2041&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-72 w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
