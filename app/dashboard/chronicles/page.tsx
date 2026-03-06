import { getChronicles } from '@/app/actions/chronicles';
import { BookOpen, Calendar } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Gia phả ký' };

export default async function ChroniclesPage() {
  const chronicles = await getChronicles(true);

  return (
    <div className="flex-1 w-full relative flex flex-col pb-12">
      <div className="w-full relative z-20 py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="title">Gia phả ký</h1>
        <p className="text-stone-500 mt-1 text-sm">
          Những trang ghi chép lịch sử, sự kiện và câu chuyện của dòng họ
        </p>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        {chronicles.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">Chưa có bài viết nào được xuất bản</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {chronicles.map((article) => (
              <Link
                key={article.id}
                href={`/dashboard/chronicles/${article.slug}`}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {article.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={article.cover_image_url}
                    alt={article.title}
                    className="w-full h-44 object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-44 bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
                    <BookOpen size={40} className="text-amber-300" />
                  </div>
                )}
                <div className="p-4">
                  <h2 className="font-semibold text-gray-800 text-lg leading-tight group-hover:text-amber-700 transition-colors">
                    {article.title}
                  </h2>
                  {article.excerpt && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{article.excerpt}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                    <Calendar size={12} />
                    {article.published_at
                      ? new Date(article.published_at).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })
                      : ''}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
