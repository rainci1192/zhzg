import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { getResearchTransferBySlug } from '@/lib/api';
import { notFound } from 'next/navigation';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

function toAbsoluteUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${STRAPI_URL}${url}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// ✅ 新增：将 Strapi Rich Text 转换为 HTML
function renderRichText(content: any): string {
  if (!content) return '';
  
  // 如果已经是字符串，直接返回
  if (typeof content === 'string') return content;
  
  // 如果是 Strapi 5 的 Rich Text 格式（数组）
  if (Array.isArray(content)) {
    return content.map(block => {
      if (block.type === 'paragraph') {
        const text = block.children?.map((child: any) => {
          if (child.type === 'text') {
            let html = child.text || '';
            if (child.bold) html = `<strong>${html}</strong>`;
            if (child.italic) html = `<em>${html}</em>`;
            if (child.underline) html = `<u>${html}</u>`;
            if (child.strikethrough) html = `<s>${html}</s>`;
            return html;
          }
          return '';
        }).join('') || '';
        return `<p>${text}</p>`;
      }
      
      if (block.type === 'heading') {
        const level = block.level || 2;
        const text = block.children?.map((child: any) => child.text || '').join('') || '';
        return `<h${level}>${text}</h${level}>`;
      }
      
      if (block.type === 'list') {
        const tag = block.format === 'ordered' ? 'ol' : 'ul';
        const items = block.children?.map((item: any) => {
          const text = item.children?.map((child: any) => child.text || '').join('') || '';
          return `<li>${text}</li>`;
        }).join('') || '';
        return `<${tag}>${items}</${tag}>`;
      }
      
      if (block.type === 'quote') {
        const text = block.children?.map((child: any) => child.text || '').join('') || '';
        return `<blockquote>${text}</blockquote>`;
      }
      
      if (block.type === 'code') {
        const text = block.children?.map((child: any) => child.text || '').join('') || '';
        return `<pre><code>${text}</code></pre>`;
      }
      
      return '';
    }).join('');
  }
  
  // 如果是对象但不是数组，尝试转换为字符串
  return JSON.stringify(content);
}

export default async function TransferDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const transfer = await getResearchTransferBySlug(slug);

  if (!transfer) {
    notFound();
  }

  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '科学研究', href: '/research/institutions' },
    { name: '成果转化', href: '/research/transfer' },
    { name: transfer.title, href: `/research/transfer/${slug}` },
  ];

  const date = transfer.publish_time ? new Date(transfer.publish_time) : null;
  const formattedDate = date
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    : '';

  // ✅ 转换 Rich Text 内容
  const contentHtml = renderRichText(transfer.content);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">成果转化</h1>
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <article className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{transfer.title}</h1>
            
            {formattedDate && (
              <div className="text-sm text-gray-500 mb-6">
                发布时间：{formattedDate}
              </div>
            )}

            {transfer.summary && (
              <div className="text-gray-600 mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-600">
                {transfer.summary}
              </div>
            )}

            {contentHtml && (
              <div
                className="prose prose-gray max-w-none mb-8"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            )}

            {transfer.attachments && transfer.attachments.length > 0 && (
              <div className="mt-8 border-t pt-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  附件下载
                </h2>
                <div className="space-y-3">
                  {transfer.attachments.map((file) => (
                    <a
                      key={file.id}
                      href={toAbsoluteUrl(file.url)}
                      download
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center text-blue-600 font-bold text-sm">
                          {file.ext.replace('.', '').toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800 group-hover:text-blue-600">
                            {file.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </div>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
