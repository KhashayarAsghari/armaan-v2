import { setRequestLocale } from 'next-intl/server';
import { PostForm } from '@/components/editor/PostForm';

export default async function NewPostPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-foreground mb-8">مقاله جدید</h1>
      <PostForm />
    </div>
  );
}
