import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Link from 'next/link';
import { getContentAll, mediaUrl, type StrapiMedia } from '@/lib/strapi-content';

type Institution = {
  id: number;
  name: string;
  slug: string;
  summary: string | null;
  cover_image: StrapiMedia | null;
};

export default async function ResearchInstitutions() {
  const sidebarItems = [
    { name: '科研机构', href: '/research/institutions' },
    { name: '科研动态', href: '/research/news' },
    { name: '成果转化', href: '/research/transfer' },
  ];

  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '科学研究', href: '/research/institutions' },
    { name: '科研机构', href: '/research/institutions' },
  ];

  const institutions = await getContentAll<Institution>('research-institutions');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">科研机构</h1>
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-6">
            <aside className="w-64 flex-shrink-0">
              <Sidebar title="科学研究" items={sidebarItems} />
            </aside>

            <div className="flex-1">
              {institutions.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-gray-500">暂无科研机构数据</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {institutions.map((inst, idx) => (
                    <Link
                      key={inst.id}
                      href={`/research/institutions/${inst.slug}`}
                      className="
                        group bg-white rounded-xl overflow-hidden
                        shadow-md hover:shadow-2xl
                        transition-all duration-500 ease-out
                        hover:-translate-y-2 hover:scale-[1.01]
                        border border-transparent hover:border-blue-100
                      "
                    >
                      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-100 to-blue-50">
                        {mediaUrl(inst.cover_image) ? (
                          <img
                            src={mediaUrl(inst.cover_image)!}
                            alt={inst.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-6xl text-blue-200 font-bold">
                            {idx + 1}
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-500" />
                        <div className="absolute bottom-3 left-3 w-0 h-0.5 bg-white/90 group-hover:w-16 transition-all duration-500" />
                      </div>

                      <div className="p-5">
                        <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                          {inst.name}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {inst.summary ? inst.summary.replace(/<[^>]*>/g, '').slice(0, 160) : '暂无简介'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
