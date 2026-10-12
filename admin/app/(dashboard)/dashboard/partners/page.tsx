'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchPartners, deletePartner, toAbsoluteUrl, type Partner } from '@/lib/api/partners';
import Link from 'next/link';
import Image from 'next/image';
import CouncilArticleEditor from './_components/CouncilArticleEditor';

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'intro'>('list');

  const loadPartners = useCallback(async () => {
    setIsLoading(true); setIsError(false);
    try { setPartners(await fetchPartners()); }
    catch { setIsError(true); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { loadPartners(); }, [loadPartners]);

  async function handleDelete(partner: Partner) {
    if (!window.confirm(`确定删除「${partner.name}」？此操作不可恢复。`)) return;
    setDeletingId(partner.id);
    try {
      await deletePartner(partner.documentId);
      await loadPartners();
    } catch (e: unknown) {
      alert('删除失败：' + (e instanceof Error ? e.message : String(e)));
    } finally { setDeletingId(null); }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">合作单位管理</h1>
          <p className="text-gray-500 text-sm mt-1">管理所有合作企业及理事单位</p>
        </div>
        {activeTab === 'list' && (
          <Link href="/dashboard/partners/new" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            <span>＋</span>新增合作单位
          </Link>
        )}
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        <button onClick={() => setActiveTab('list')} className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          单位列表
        </button>
        <button onClick={() => setActiveTab('intro')} className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'intro' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          理事会说明
        </button>
      </div>

      {activeTab === 'intro' ? (
        <CouncilArticleEditor />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <StatCard label="全部单位" value={partners.length} color="blue" />
            <StatCard label="理事单位" value={partners.filter((p) => p.is_council).length} color="green" />
            <StatCard label="已启用" value={partners.filter((p) => p.is_active).length} color="gray" />
          </div>

          {isLoading ? (
            <div className="text-center py-20 text-gray-400">加载中...</div>
          ) : isError ? (
            <div className="text-center py-20 space-y-3">
              <p className="text-red-400">加载失败，请检查 Strapi 服务</p>
              <button onClick={loadPartners} className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">重新加载</button>
            </div>
          ) : partners.length === 0 ? (
            <div className="text-center py-20 text-gray-400">暂无合作单位数据</div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium w-16">Logo</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">企业名称</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium hidden md:table-cell">网址</th>
                    <th className="text-center px-4 py-3 text-gray-600 font-medium">理事单位</th>
                    <th className="text-center px-4 py-3 text-gray-600 font-medium">启用</th>
                    <th className="text-center px-4 py-3 text-gray-600 font-medium w-12">排序</th>
                    <th className="text-right px-4 py-3 text-gray-600 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {partners.map((partner) => (
                    <tr key={partner.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        {partner.logo ? (
                          <div className="relative w-12 h-10">
                            <Image src={toAbsoluteUrl(partner.logo.url)} alt={partner.name} fill className="object-contain rounded border border-gray-100 bg-gray-50 p-1" unoptimized />
                          </div>
                        ) : (
                          <div className="w-12 h-10 rounded border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center text-gray-300 text-xs">无</div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">{partner.name}</td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell max-w-[180px] truncate">
                        {partner.website ? (
                          <a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{partner.website}</a>
                        ) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center"><Badge active={partner.is_council} activeText="理事" inactiveText="普通" /></td>
                      <td className="px-4 py-3 text-center"><Badge active={partner.is_active} activeText="启用" inactiveText="禁用" /></td>
                      <td className="px-4 py-3 text-center text-gray-400">{partner.sort_order}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/dashboard/partners/${partner.documentId}`} className="px-3 py-1 text-xs rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">编辑</Link>
                          <button onClick={() => handleDelete(partner)} disabled={deletingId === partner.id} className="px-3 py-1 text-xs rounded-md bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-50">
                            {deletingId === partner.id ? '删除中' : '删除'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: 'blue' | 'green' | 'gray' }) {
  const colorMap = { blue: 'bg-blue-50 text-blue-700', green: 'bg-green-50 text-green-700', gray: 'bg-gray-50 text-gray-700' };
  return <div className={`rounded-xl p-4 ${colorMap[color]}`}><p className="text-sm opacity-75">{label}</p><p className="text-3xl font-bold mt-1">{value}</p></div>;
}

function Badge({ active, activeText, inactiveText }: { active: boolean; activeText: string; inactiveText: string }) {
  return <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>{active ? activeText : inactiveText}</span>;
}
