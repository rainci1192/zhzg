import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { ReactNode } from 'react';

type Crumb = { name: string; href: string };

export default function AboutSingleLayout({
  pageTitle,
  sectionTitle,
  breadcrumbItems,
  children,
}: {
  pageTitle: string;
  sectionTitle: string;
  breadcrumbItems: Crumb[];
  children: ReactNode;
}) {
  const sidebarItems = [
    { name: '学院简介', href: '/about/intro' },
    { name: '理事会', href: '/about/council' },
    { name: '现任领导', href: '/about/leaders' },
    { name: '机构设置', href: '/about/organization' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">{pageTitle}</h1>
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-6">
            <aside className="w-64 flex-shrink-0">
              <Sidebar title="学院概况" items={sidebarItems} />
            </aside>

            <div className="flex-1 bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-600">
                {sectionTitle}
              </h2>
              {children}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
