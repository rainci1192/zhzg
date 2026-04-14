'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Settings, Save } from 'lucide-react';

interface SiteConfigItem {
  id: string;
  documentId?: string;
  site_name?: string;
  icp?: string;
  footer_text?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}

interface SiteConfigResponse {
  data: SiteConfigItem[];
  meta?: unknown;
}

export default function SiteSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [configId, setConfigId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    site_name: '',
    icp: '',
    footer_text: '',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
  });

  const fetchSetting = async () => {
    try {
      setError(null);
      const response = (await api.getSiteSetting()) as SiteConfigResponse;

      const first = Array.isArray(response?.data) ? response.data[0] : undefined;

      if (first) {
        setConfigId(first.documentId || first.id);
        setFormData({
          site_name: first.site_name || '',
          icp: first.icp || '',
          footer_text: first.footer_text || '',
          seo_title: first.seo_title || '',
          seo_description: first.seo_description || '',
          seo_keywords: first.seo_keywords || '',
        });
      } else {
        setConfigId(null);
        setFormData({
          site_name: '',
          icp: '',
          footer_text: '',
          seo_title: '',
          seo_description: '',
          seo_keywords: '',
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '获取站点设置失败';
      console.error('❌ 获取站点设置失败', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSetting();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      if (configId) {
        await api.updateSiteSetting(configId, formData);
      } else {
        await api.createSiteSetting(formData);
      }

      alert('站点设置保存成功');
      await fetchSetting();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '保存失败';
      console.error('❌ 保存失败', err);
      setError(message);
      alert('保存失败，请检查控制台');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-8 h-8" />
          站点设置
        </h1>
        <p className="text-gray-500 mt-1">配置网站基础信息与 SEO 信息</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-2xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">基础信息</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">网站名称</label>
              <input
                type="text"
                value={formData.site_name}
                onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500"
                placeholder="吉林大学国家卓越工程师学院"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">备案号（ICP）</label>
              <input
                type="text"
                value={formData.icp}
                onChange={(e) => setFormData({ ...formData, icp: e.target.value })}
                className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500"
                placeholder="吉ICP备xxxxxx号"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">页脚文字</label>
            <textarea
              value={formData.footer_text}
              onChange={(e) => setFormData({ ...formData, footer_text: e.target.value })}
              rows={3}
              className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500"
              placeholder="版权所有 © 吉林大学国家卓越工程师学院"
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">SEO 设置</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SEO 标题</label>
              <input
                type="text"
                value={formData.seo_title}
                onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500"
                placeholder="网站首页 SEO 标题"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SEO 描述</label>
              <textarea
                value={formData.seo_description}
                onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                rows={4}
                className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500"
                placeholder="网站描述（建议 80~160 字）"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SEO 关键词</label>
              <input
                type="text"
                value={formData.seo_keywords}
                onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })}
                className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500"
                placeholder="关键词1,关键词2,关键词3"
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-2xl transition-all"
          >
            <Save className="w-5 h-5" />
            {saving ? '保存中...' : '保存设置'}
          </button>
        </div>
      </form>
    </div>
  );
}
