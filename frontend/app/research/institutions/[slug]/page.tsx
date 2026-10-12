import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { getContentDetail, mediaUrl, type StrapiMedia } from '@/lib/strapi-content';

type Institution = {
  id: number;
  name: string;
  summary: string | null;
  cover_image: StrapiMedia | null;
};

export default async function InstitutionDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const sidebarItems = [
    { name: '科研机构', href: '/research/institutions' },
    { name: '科研动态', href: '/research/news' },
    { name: '成果转化', href: '/research/transfer' },
  ];

  const inst = await getContentDetail<Institution>('research-institutions', slug);
  if (!inst) notFound();

  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '科学研究', href: '/research/institutions' },
    { name: '科研机构', href: '/research/institutions' },
    { name: inst.name, href: `/research/institutions/${slug}` },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
             <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-6">
            <aside className="w-64 flex-shrink-0">
              <Sidebar title="科学研究" items={sidebarItems} />
            </aside>

            <div className="flex-1 bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-600">
                {inst.name}
              </h2>

              <div
                className="prose prose-gray max-w-none text-[20px] leading-9 md:text-[21px] md:leading-10"
                dangerouslySetInnerHTML={{ __html: inst.summary || '<p>暂无详细介绍。</p>' }}
              />

              {mediaUrl(inst.cover_image) && (
                <div className="mt-10">
                  <img
                    src={mediaUrl(inst.cover_image)!}
                    alt={inst.name}
                    className="w-full rounded-lg shadow-md object-cover"
                  />
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
