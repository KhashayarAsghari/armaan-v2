'use client';

import { useMemo, useState, type ChangeEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  BriefcaseBusiness,
  CheckCircle2,
  FileUp,
  Gavel,
  PackageCheck,
  Send,
  ShieldCheck,
  Truck,
} from 'lucide-react';

type ServiceKey =
  | 'customsBrokerage'
  | 'tradeConsulting'
  | 'legalConsulting'
  | 'transportServices'
  | 'specializedTraining';

const MAX_FILES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'doc', 'docx'];

const schema = z.object({
  fullName: z.string().min(2),
  companyName: z.string().optional(),
  phone: z.string().min(8),
  email: z.string().email(),
  city: z.string().min(2),
  subject: z.string().min(10),
  uploadLink: z.string().optional(),
  responseMethods: z.array(z.enum(['phone', 'online', 'inPerson'])).min(1),
  confirm: z.literal(true),
});

type FormData = z.infer<typeof schema>;

function fileExt(name: string) {
  const parts = name.split('.');
  return parts.length > 1 ? parts.at(-1)?.toLowerCase() ?? '' : '';
}

export function ConsultationPageContent() {
  const t = useTranslations('consultationPage');
  const locale = useLocale();
  const [selectedService, setSelectedService] = useState<ServiceKey>('customsBrokerage');
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const serviceOptions = useMemo(
    () => [
      { key: 'customsBrokerage' as const, icon: ShieldCheck },
      { key: 'tradeConsulting' as const, icon: BriefcaseBusiness },
      { key: 'legalConsulting' as const, icon: Gavel },
      { key: 'transportServices' as const, icon: Truck },
      { key: 'specializedTraining' as const, icon: PackageCheck },
    ],
    []
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      responseMethods: [],
      confirm: false,
    },
  });

  const fieldClass =
    'w-full rounded-xl border border-white/10 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-[#C4A24D]/60 focus:outline-none focus:ring-2 focus:ring-[#C4A24D]/10';

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(event.target.files ?? []);
    setFileError(null);

    if (incoming.length === 0) return;

    const nextFiles = [...files, ...incoming];

    if (nextFiles.length > MAX_FILES) {
      setFileError(t('upload.fileValidation.maxFiles'));
      return;
    }

    const invalidBySize = nextFiles.find((file) => file.size > MAX_FILE_SIZE);
    if (invalidBySize) {
      setFileError(t('upload.fileValidation.maxSize'));
      return;
    }

    const invalidByType = nextFiles.find((file) => !ACCEPTED_EXTENSIONS.includes(fileExt(file.name)));
    if (invalidByType) {
      setFileError(t('upload.fileValidation.type'));
      return;
    }

    setFiles(nextFiles);
    event.target.value = '';
  }

  function removeFile(name: string) {
    setFiles((prev) => prev.filter((file) => file.name !== name));
  }

  async function onSubmit(data: FormData) {
    setLoading(true);
    setFileError(null);
    setSubmitError(null);

    try {
      const uploadedFiles = await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          const uploadRes = await fetch('/api/consultation/upload', {
            method: 'POST',
            body: formData,
          });
          if (!uploadRes.ok) {
            throw new Error('upload-failed');
          }
          return (await uploadRes.json()) as {
            url: string;
            name: string;
            size: number;
            type: string;
          };
        })
      );

      const res = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale,
          serviceType: selectedService,
          subject: data.subject,
          fullName: data.fullName,
          companyName: data.companyName || null,
          phone: data.phone,
          email: data.email,
          city: data.city,
          responseMethods: data.responseMethods,
          uploadLink: data.uploadLink?.trim() || null,
          uploadedFiles,
          consent: data.confirm,
        }),
      });

      if (!res.ok) {
        throw new Error('submit-failed');
      }

      setSuccess(true);
      reset();
      setFiles([]);
    } catch {
      setSubmitError(t('submitError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-background px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <header className="text-center">
          <div className="gold-divider mb-6" />
          <h1 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">{t('title')}</h1>
          <p className="mx-auto max-w-3xl text-sm text-muted-foreground sm:text-base">{t('subtitle')}</p>
        </header>

        <section className="space-y-5 rounded-3xl border border-white/8 bg-card p-6 shadow-2xl shadow-black/10 sm:p-8">
          <h2 className="text-lg font-bold text-foreground sm:text-xl">{t('services.title')}</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {serviceOptions.map(({ key, icon: Icon }, index) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedService(key)}
                className={`rounded-2xl border p-4 text-start transition-all duration-300 ${
                  selectedService === key
                    ? 'border-[#C4A24D]/55 bg-[#C4A24D]/15'
                    : 'border-white/8 bg-background/40 hover:border-[#C4A24D]/30'
                }`}
              >
                <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#C4A24D]/30 bg-[#C4A24D]/10">
                  <Icon size={16} className="text-[#C4A24D]" />
                </div>
                <p className="text-xs text-[#C4A24D]">{index + 1}</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {t(`services.options.${key}.label`)}
                </p>
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-white/8 bg-background/70 p-5">
            <h3 className="mb-3 text-base font-bold text-foreground">
              {t(`services.options.${selectedService}.heading`)}
            </h3>

            {selectedService === 'customsBrokerage' ? (
              <ul className="space-y-2 text-sm text-foreground/85">
                {[
                  'item1',
                  'item2',
                  'item3',
                  'item4',
                  'item5',
                  'item6',
                  'item7',
                  'item8',
                  'item9',
                ].map((itemKey) => (
                  <li key={itemKey} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#C4A24D]" />
                    <span>{t(`services.customsItems.${itemKey}`)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm leading-7 text-muted-foreground">
                {t(`services.options.${selectedService}.description`)}
              </p>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-white/8 bg-card p-6 shadow-2xl shadow-black/10 sm:p-8">
          {success ? (
            <div className="flex min-h-72 flex-col items-center justify-center gap-4 text-center">
              <CheckCircle2 size={56} className="text-[#C4A24D]" />
              <p className="max-w-3xl text-sm leading-8 text-foreground sm:text-base">{t('successMessage')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  {t('form.subjectLabel')}
                </label>
                <textarea
                  {...register('subject')}
                  rows={4}
                  className={`${fieldClass} resize-none ${errors.subject ? 'border-red-500/60' : ''}`}
                  placeholder={t('form.subjectPlaceholder')}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-bold text-foreground">{t('form.applicantInfo')}</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      {t('form.fullName')}
                    </label>
                    <input
                      {...register('fullName')}
                      className={`${fieldClass} ${errors.fullName ? 'border-red-500/60' : ''}`}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      {t('form.companyName')}
                    </label>
                    <input {...register('companyName')} className={fieldClass} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">{t('form.phone')}</label>
                    <input
                      {...register('phone')}
                      className={`${fieldClass} ${errors.phone ? 'border-red-500/60' : ''}`}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">{t('form.email')}</label>
                    <input
                      {...register('email')}
                      type="email"
                      className={`${fieldClass} ${errors.email ? 'border-red-500/60' : ''}`}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-foreground">{t('form.city')}</label>
                    <input
                      {...register('city')}
                      className={`${fieldClass} ${errors.city ? 'border-red-500/60' : ''}`}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-white/8 bg-background/70 p-5">
                <h3 className="text-base font-bold text-foreground">{t('upload.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('upload.description')}</p>
                <p className="text-xs text-[#C4A24D]">{t('upload.rules')}</p>

                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#C4A24D]/35 bg-[#C4A24D]/10 px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-[#C4A24D]/20">
                  <FileUp size={16} className="text-[#C4A24D]" />
                  {t('upload.button')}
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.doc,.docx"
                    onChange={onFileChange}
                  />
                </label>

                {files.length > 0 ? (
                  <div className="space-y-2">
                    {files.map((file) => (
                      <div
                        key={file.name}
                        className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-xs text-foreground"
                      >
                        <span>{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(file.name)}
                          className="text-muted-foreground hover:text-red-400"
                        >
                          {t('upload.remove')}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">{t('upload.noFiles')}</p>
                )}

                {fileError ? <p className="text-xs text-red-400">{fileError}</p> : null}

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    {t('upload.uploadLink')}
                  </label>
                  <input {...register('uploadLink')} className={fieldClass} placeholder="https://..." />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-foreground">{t('response.title')}</h3>
                <div className="flex flex-wrap gap-3">
                  {(['phone', 'online', 'inPerson'] as const).map((method) => (
                    <label
                      key={method}
                      className="inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-2 text-sm text-foreground hover:border-[#C4A24D]/35"
                    >
                      <input type="checkbox" value={method} {...register('responseMethods')} />
                      {t(`response.methods.${method}`)}
                    </label>
                  ))}
                </div>
                {errors.responseMethods ? (
                  <p className="text-xs text-red-400">{t('response.validation')}</p>
                ) : null}
              </div>

              <div className="space-y-2 rounded-2xl border border-white/8 bg-background/60 p-5">
                <h3 className="text-base font-bold text-foreground">{t('confirm.title')}</h3>
                <label className="inline-flex items-start gap-2 text-sm leading-7 text-muted-foreground">
                  <input type="checkbox" className="mt-1" {...register('confirm')} />
                  {t('confirm.text')}
                </label>
                {errors.confirm ? <p className="text-xs text-red-400">{t('confirm.validation')}</p> : null}
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
                    {t('submit')}
                  </>
                )}
              </button>

              {submitError ? <p className="text-center text-xs text-red-400">{submitError}</p> : null}
            </form>
          )}
        </section>
      </div>
    </section>
  );
}
