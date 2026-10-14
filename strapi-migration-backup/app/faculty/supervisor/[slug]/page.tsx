import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { getSupervisorBySlug } from '@/lib/api';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';  // ✅ 添加这行

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

function toAbsoluteUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${STRAPI_URL}${url}`;
}

export default async function SupervisorDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supervisor = await getSupervisorBySlug(slug);

  if (!supervisor) {
    notFound();
  }

  const categoryText = supervisor.category === 'internal' ? '校内培养导师' : '企业培养导师';
  const categoryHref = supervisor.category === 'internal' ? '/faculty/internal' : '/faculty/enterprise';

  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '师资队伍', href: '/faculty/internal' },
    { name: categoryText, href: categoryHref },
    { name: supervisor.name, href: `/faculty/supervisor/${slug}` },
  ];

  const photoUrl = toAbsoluteUrl(supervisor.photo?.url);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">导师详情</h1>
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <article className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              {/* 照片 */}
              <div className="flex-shrink-0">
                {photoUrl ? (
                  <div className="relative w-48 h-48 rounded-lg overflow-hidden border-4 border-blue-100">
                    <Image
                      src={photoUrl}
                      alt={supervisor.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center border-4 border-blue-100">
                    <div className="text-center">
                      <div className="text-6xl text-blue-300 mb-2">👤</div>
                      <div className="text-sm text-gray-500">暂无照片</div>
                    </div>
                  </div>
                )}
              </div>

              {/* 基本信息 */}
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">{supervisor.name}</h1>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 font-medium w-20">职称：</span>
                    <span className="text-gray-800">{supervisor.title}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 font-medium w-20">类型：</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        supervisor.category === 'internal'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {categoryText}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 font-medium w-20">学院：</span>
                    <span className="text-gray-800">{supervisor.college}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 font-medium w-20">专业：</span>
                    <span className="text-gray-800">{supervisor.major}</span>
                  </div>

                  {supervisor.personal_website && (
                    <div className="flex items-center gap-3">
                      <span className="text-gray-600 font-medium w-20">网站：</span>
                      <a
                        href={supervisor.personal_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                      >
                        {supervisor.personal_website}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 简介 */}
            {supervisor.bio && (
              <div className="border-t pt-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">个人简介</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {supervisor.bio}
                  </p>
                </div>
              </div>
            )}

            {/* 返回按钮 - 修改为 Link 组件 */}
            <div className="mt-8 pt-6 border-t">
              <Link
                href={categoryHref}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                返回{categoryText}列表
              </Link>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
