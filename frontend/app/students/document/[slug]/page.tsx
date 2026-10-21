import { sanitizeRichHtml } from '@/lib/sanitize-html';
// app/students/document/[slug]/page.tsx
import { notFound, redirect } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/layout/PageHero';
import { getContentDetail, mediaUrl, mediaSize, type StrapiMedia } from '@/lib/strapi-content';
import { contentDestination, contentDownloadHref } from '@/lib/content-destination';

type StudentDocument = {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  redirect_url?: string | null;
  content: string | null;
  publish_time: string | null;
  attachments: StrapiMedia[] | null;
};

export default async function StudentDocumentDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const document = await getContentDetail<StudentDocument>('student-documents', slug);
  if (!document) notFound();
  const destination = contentDestination('student-documents', document);
  if (destination.kind !== 'detail') redirect(destination.href);
  const attachments = (document.attachments || []).filter((item) => mediaUrl(item));

  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '学生工作', href: '/students/management' },
    { name: '学生管理', href: '/students/management' },
    { name: document.title, href: `/students/document/${slug}` },
  ];

  return (
    <>
      <Header />

      <PageHero title="学生管理" items={breadcrumbItems} />

      <div className="site-detail-body max-w-5xl mx-auto px-6 py-10">
        <div className="site-detail-panel bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{document.title}</h1>

          {document.publish_time && (
            <div className="text-gray-500 mb-6 pb-6 border-b">
              发布时间：{new Date(document.publish_time).toLocaleDateString('zh-CN')}
            </div>
          )}

          {document.content && (
            <div
              className="prose prose-gray max-w-none text-lg leading-relaxed mb-8"
              dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(document.content) }}
            />
          )}

          {attachments.length > 0 && (
            <div className="mt-8 pt-8 border-t">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-600">
                附件下载
              </h2>
              <div className="space-y-3">
                {attachments.map((att, idx) => (
                  <a
                    key={idx}
                    href={contentDownloadHref('student-documents', document.documentId, att)}
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-blue-50 hover:shadow-md transition-all group"
                  >
                    <svg
                      className="w-8 h-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {att.name}
                      </div>
                      <div className="text-sm text-gray-500">{mediaSize(att)}</div>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
