import { notFound, redirect } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/layout/PageHero';
import { getDownloadFileDetail, mediaSize, mediaUrl, type StrapiMedia } from '@/lib/strapi-content';
import { contentDestination, contentDownloadHref } from '@/lib/content-destination';

type DownloadFile = {
  documentId: string;
  title: string;
  description?: string | null;
  redirect_url?: string | null;
  file?: StrapiMedia | null;
};

export default async function DownloadFileDetail({ params }: { params: Promise<{ documentId: string }> }) {
  const { documentId } = await params;
  const file = await getDownloadFileDetail<DownloadFile>(documentId);
  if (!file) notFound();
  const destination = contentDestination('download-files', file);
  if (destination.kind !== 'detail') redirect(destination.href);

  return (
    <>
      <Header />
      <PageHero title="资料下载" items={[
        { name: '首页', href: '/' },
        { name: '管理文件', href: '/documents/policies' },
        { name: '资料下载', href: '/documents/downloads' },
        { name: file.title, href: `/documents/downloads/${documentId}` },
      ]} />
      <main className="site-detail-body max-w-5xl mx-auto px-6 py-10">
        <article className="site-detail-panel bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">{file.title}</h1>
          {file.description && <p className="whitespace-pre-wrap text-lg leading-relaxed text-gray-700">{file.description}</p>}
          {file.file && mediaUrl(file.file) && (
            <div className="mt-8 pt-8 border-t">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">附件下载</h2>
              <a className="block p-4 bg-gray-50 rounded-lg text-blue-700 hover:bg-blue-50" href={contentDownloadHref('download-files', documentId, file.file)}>
                {file.file.name} {mediaSize(file.file) && `(${mediaSize(file.file)})`}
              </a>
            </div>
          )}
        </article>
      </main>
      <Footer />
    </>
  );
}
