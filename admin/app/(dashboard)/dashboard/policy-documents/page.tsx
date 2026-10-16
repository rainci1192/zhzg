'use client';

import { strapiFetch } from '@/lib/strapi-fetch';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const WordLikeEditor = dynamic(() => import('@/components/editor/WordLikeEditor'), { ssr: false });

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

interface UploadedFile {
  id: number;
  url: string;
}

interface PolicyDocument {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  content?: string | null;
  attachments?: Array<{
    id: number;
    name: string;
    url: string;
    ext: string;
    size: number;
  }> | null;
  publish_time?: string | null;
  is_active: boolean;
  sort_order: number;
}

interface StrapiResponse {
  data: Array<{
    id: number;
    documentId: string;
    title: string;
    slug: string;
    content?: string | null;
    attachments?: Array<{
      id: number;
      name: string;
      url: string;
      ext: string;
      size: number;
    }> | null;
    publish_time?: string | null;
    is_active: boolean;
    sort_order: number;
  }>;
}

interface FormDataType {
  title: string;
  slug: string;
  content: string;
  publish_time: string;
  is_active: boolean;
  sort_order: number;
}

export default function PolicyDocumentsManagement() {
  const [documents, setDocuments] = useState<PolicyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState<PolicyDocument | null>(null);
  const [formData, setFormData] = useState<FormDataType>({
    title: '',
    slug: '',
    content: '',
    publish_time: new Date().toISOString().slice(0, 16),
    is_active: true,
    sort_order: 0,
  });
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await strapiFetch(`${STRAPI_URL}/api/policy-documents?populate=attachments&sort[0]=sort_order:asc&sort[1]=publish_time:desc`);
      const data: StrapiResponse = await response.json();
      setDocuments(data.data.map((item) => ({
        id: item.id,
        documentId: item.documentId,
        title: item.title,
        slug: item.slug,
        content: item.content,
        attachments: item.attachments,
        publish_time: item.publish_time,
        is_active: item.is_active,
        sort_order: item.sort_order,
      })));
    } catch (error) {
      console.error('获取政策文件列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadAttachments = async (files: File[]): Promise<number[]> => {
    try {
      const uploadFormData = new FormData();
      files.forEach(file => uploadFormData.append('files', file));
      const response = await strapiFetch(`${STRAPI_URL}/api/upload`, {
        method: 'POST',
        body: uploadFormData,
      });
      if (response.ok) {
        const data: Array<{ id: number }> = await response.json();
        return data.map(item => item.id);
      }
      return [];
    } catch (error) {
      console.error('上传附件失败:', error);
      return [];
    }
  };

  const handleEditorUpload = async (file: File): Promise<string> => {
    const uploadFormData = new FormData();
    uploadFormData.append('files', file);
    const response = await strapiFetch(`${STRAPI_URL}/api/upload`, {
      method: 'POST',
      body: uploadFormData,
    });
    if (!response.ok) throw new Error('图片上传失败');
    const data: UploadedFile[] = await response.json();
    const url = data[0]?.url || '';
    return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let attachmentIds = editingDocument?.attachments?.map(a => a.id) || [];
      if (attachmentFiles.length > 0) {
        const newIds = await uploadAttachments(attachmentFiles);
        if (newIds.length === 0) {
          alert('附件上传失败，请重试');
          return;
        }
        attachmentIds = [...attachmentIds, ...newIds];
      }

      const payload = {
        data: {
          ...formData,
          ...(attachmentIds.length > 0 ? { attachments: attachmentIds } : {}),
        },
      };

      const url = editingDocument
        ? `${STRAPI_URL}/api/policy-documents/${editingDocument.documentId}`
        : `${STRAPI_URL}/api/policy-documents`;
      const method = editingDocument ? 'PUT' : 'POST';

      const response = await strapiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingDocument(null);
        setFormData({
          title: '',
          slug: '',
          content: '',
          publish_time: new Date().toISOString().slice(0, 16),
          is_active: true,
          sort_order: 0,
        });
        setAttachmentFiles([]);
        fetchDocuments();
      } else {
        const errorData: { error?: { message?: string } } = await response.json();
        console.error('保存失败:', errorData);
        alert('保存失败，请重试');
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    }
  };

  const handleEdit = (document: PolicyDocument) => {
    setEditingDocument(document);
    setFormData({
      title: document.title,
      slug: document.slug,
      content: document.content || '',
      publish_time: document.publish_time
        ? new Date(document.publish_time).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
      is_active: document.is_active,
      sort_order: document.sort_order,
    });
    setAttachmentFiles([]);
    setShowModal(true);
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('确定要删除这个政策文件吗？')) return;
    try {
      const response = await strapiFetch(`${STRAPI_URL}/api/policy-documents/${documentId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchDocuments();
      } else {
        const errorData: { error?: { message?: string } } = await response.json();
        console.error('删除失败:', errorData);
        alert('删除失败，请重试');
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请重试');
    }
  };

  const handleAdd = () => {
    setEditingDocument(null);
    setFormData({
      title: '',
      slug: '',
      content: '',
      publish_time: new Date().toISOString().slice(0, 16),
      is_active: true,
      sort_order: 0,
    });
    setAttachmentFiles([]);
    setShowModal(true);
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttachmentFiles(Array.from(e.target.files || []));
  };

  const removeExistingAttachment = async (attachmentId: number) => {
    if (!editingDocument) return;
    const updatedAttachments = editingDocument.attachments
      ?.filter(a => a.id !== attachmentId)
      .map(a => a.id) || [];
    try {
      const response = await strapiFetch(`${STRAPI_URL}/api/policy-documents/${editingDocument.documentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { attachments: updatedAttachments } }),
      });
      if (response.ok) {
        fetchDocuments();
        const updatedDoc = documents.find(d => d.documentId === editingDocument.documentId);
        if (updatedDoc) setEditingDocument(updatedDoc);
      }
    } catch (error) {
      console.error('删除附件失败:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">加载中...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">政策文件管理</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          添加政策文件
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标题</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">发布时间</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">附件</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">排序</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {documents.map((doc) => (
              <tr key={doc.documentId}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  <span className="line-clamp-1">{doc.title}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.slug}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {doc.publish_time ? new Date(doc.publish_time).toLocaleDateString('zh-CN') : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {doc.attachments?.length || 0} 个
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.sort_order}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${doc.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {doc.is_active ? '启用' : '禁用'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                  <button onClick={() => handleEdit(doc)} className="text-blue-600 hover:text-blue-900" title="编辑">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(doc.documentId)} className="text-red-600 hover:text-red-900" title="删除">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingDocument ? '编辑政策文件' : '添加政策文件'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">标题 *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入标题"
                  />
                </div>

                <p className="text-sm text-gray-500">访问标识由系统根据标题自动生成英文内容，并检查唯一性。</p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">内容</label>
                  <WordLikeEditor
                    value={formData.content}
                    onChange={(html) => setFormData({ ...formData, content: html })}
                    uploadImage={handleEditorUpload}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">发布时间</label>
                  <input
                    type="datetime-local"
                    value={formData.publish_time}
                    onChange={(e) => setFormData({ ...formData, publish_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">附件</label>
                  <input
                    type="file"
                    multiple
                    onChange={handleAttachmentChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">可以选择多个文件</p>

                  {attachmentFiles.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm font-medium text-gray-700">待上传文件：</p>
                      {attachmentFiles.map((file, idx) => (
                        <div key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {file.name} ({(file.size / 1024).toFixed(2)} KB)
                        </div>
                      ))}
                    </div>
                  )}

                  {editingDocument?.attachments && editingDocument.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-medium text-gray-700">已有附件：</p>
                      {editingDocument.attachments.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {file.name}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeExistingAttachment(file.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="数字越小越靠前"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">启用显示</label>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingDocument(null); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
