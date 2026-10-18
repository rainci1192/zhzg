// app/faculty/internal/page.tsx
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import PageHero from '@/components/layout/PageHero';
import SupervisorDirectory, { type SupervisorCard } from '@/components/faculty/SupervisorDirectory';
import { getContentAll } from '@/lib/strapi-content';

export default async function InternalSupervisors() {
  const sidebarItems = [
    { name: '校内培养导师', href: '/faculty/internal' },
    { name: '企业培养导师', href: '/faculty/enterprise' },
  ];

  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '师资队伍', href: '/faculty/internal' },
    { name: '校内培养导师', href: '/faculty/internal' },
  ];

  const supervisors = await getContentAll<SupervisorCard>('supervisors', 'internal');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50 site-subpage">
        <PageHero title="校内培养导师" items={breadcrumbItems} />

        <div className="max-w-7xl mx-auto px-4 py-8 site-page-body">
          <div className="flex gap-6 site-column-layout">
            <aside className="w-64 flex-shrink-0 site-column-aside">
              <Sidebar title="师资队伍" items={sidebarItems} />
            </aside>

            <div className="flex-1 bg-white rounded-lg shadow-sm p-8">
              <SupervisorDirectory supervisors={supervisors} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
