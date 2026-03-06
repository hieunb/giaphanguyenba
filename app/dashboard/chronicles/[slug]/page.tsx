import { getChronicle } from '@/app/actions/chronicles';
import { ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = await getChronicle(slug);
  return { title: article?.title || 'Gia phả ký' };
}

export default async function ChroniclePage({ params }: Props) {
  const { slug } = await params;
  const article = await getChronicle(slug);

  if (!article) return notFound();

  return (
    <div className="flex-1 w-full relative flex flex-col pb-16">
      {/* Back link */}
      <div className="w-full py-4 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <Link
          href="/dashboard/chronicles"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-amber-700 transition-colors"
        >
          <ArrowLeft size={14} />
          Quay lại Gia phả ký
        </Link>
      </div>

      {/* Cover image */}
      {article.cover_image_url && (
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.cover_image_url}
            alt={article.title}
            className="w-full max-h-72 object-cover rounded-2xl shadow-md"
          />
        </div>
      )}

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
            {article.title}
          </h1>
          {article.excerpt && (
            <p className="mt-2 text-gray-600 text-base italic">{article.excerpt}</p>
          )}
          <div className="flex items-center gap-3 mt-3 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar size={13} />
              {article.published_at
                ? new Date(article.published_at).toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : ''}
            </span>
          </div>
          <hr className="mt-4 border-amber-100" />
        </div>

        {/* Content */}
        {article.content ? (
          <div
            className="chronicle-content max-w-none text-gray-800 leading-relaxed"
            // Content is admin-managed (trusted source)
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        ) : (
          <p className="text-gray-400 italic">Bài viết chưa có nội dung.</p>
        )}
      </article>
    </div>
  );
}
