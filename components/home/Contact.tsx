'use client';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect, useRef } from 'react';
import { MapPin, Phone, Mail, Send, CheckCircle2 } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(10),
});
type FormData = z.infer<typeof schema>;

export function Contact() {
  const t = useTranslations('contact');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const els = section.querySelectorAll<HTMLElement>('[data-reveal]');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) (e.target as HTMLElement).classList.add('visible'); }),
      { threshold: 0.1 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

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

  const fieldClass = `w-full px-4 py-3 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-[#C4A24D]/60 focus:ring-2 focus:ring-[#C4A24D]/10 transition-all duration-200`;
  const errClass = `border-red-500/60`;

  return (
    <section ref={sectionRef} className="py-24 px-4 sm:px-6 lg:px-10 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16" data-reveal>
          <div className="gold-divider mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{t('title')}</h2>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Contact info */}
          <div className="reveal-right lg:col-span-2 flex flex-col gap-6" data-reveal>
            {[
              { icon: MapPin, label: t('address'), value: t('addressValue') },
              { icon: Phone, label: t('phone2'), value: t('phoneValue') },
              { icon: Mail, label: t('emailLabel'), value: t('emailValue') },
            ].map(({ icon: Icon, label, value }, i) => (
              <div key={i} className="flex items-start gap-4 p-5 rounded-2xl border border-white/6 bg-card">
                <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-[#C4A24D]/10 border border-[#C4A24D]/20">
                  <Icon size={18} className="text-[#C4A24D]" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-foreground">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="reveal-left lg:col-span-3 rounded-3xl border border-white/6 bg-card p-7 sm:p-9" data-reveal>
            {success ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 py-12 text-center">
                <CheckCircle2 size={48} className="text-[#C4A24D]" />
                <h3 className="text-lg font-bold text-foreground">{t('success')}</h3>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      {...register('name')}
                      placeholder={t('name')}
                      className={`${fieldClass} ${errors.name ? errClass : 'border-white/10'}`}
                    />
                  </div>
                  <div>
                    <input
                      {...register('email')}
                      type="email"
                      placeholder={t('email')}
                      className={`${fieldClass} ${errors.email ? errClass : 'border-white/10'}`}
                    />
                  </div>
                </div>
                <input
                  {...register('phone')}
                  placeholder={t('phone')}
                  className={`${fieldClass} border-white/10`}
                />
                <textarea
                  {...register('message')}
                  rows={5}
                  placeholder={t('message')}
                  className={`${fieldClass} resize-none ${errors.message ? errClass : 'border-white/10'}`}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-[#C4A24D] hover:bg-[#D4B86A] text-black font-bold text-base transition-all duration-300 shadow-lg shadow-[#C4A24D]/20 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="w-5 h-5 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                  ) : (
                    <>
                      <Send size={18} />
                      {t('submit')}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
