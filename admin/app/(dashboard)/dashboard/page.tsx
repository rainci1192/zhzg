'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type CountResponse = { meta?: { pagination?: { total?: number } } };
type Counts = {
  published: number | null;
  pending: number | null;
  categories: number | null;
  banners: number | null;
};

const emptyCounts: Counts = {
  published: null,
  pending: null,
  categories: null,
  banners: null,
};

function totalFrom(response: unknown): number | null {
  const total = (response as CountResponse)?.meta?.pagination?.total;
  return typeof total === 'number' ? total : null;
}

export default function DashboardPage() {
  const [counts, setCounts] = useState<Counts>(emptyCounts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      const requests = await Promise.allSettled([
        api.getArticles('?filters[review_status][$eq]=published&pagination[pageSize]=1'),
        api.getArticles('?filters[review_status][$eq]=pending&pagination[pageSize]=1'),
        api.getCategories('?pagination[pageSize]=1'),
        api.getBanners('?pagination[pageSize]=1'),
      ]);
      if (!active) return;
      const values = requests.map((result) =>
        result.status === 'fulfilled' ? totalFrom(result.value) : null
      );
      setCounts({
        published: values[0],
        pending: values[1],
        categories: values[2],
        banners: values[3],
      });
      setLoading(false);
    }

    void load();
    return () => { active = false; };
  }, []);

  const cards = [
    { label: '已发布文章', value: counts.published, color: 'text-blue-600' },
    { label: '待审核内容', value: counts.pending, color: 'text-amber-600' },
    { label: '栏目总数', value: counts.categories, color: 'text-emerald-600' },
    { label: '轮播图总数', value: counts.banners, color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">欢迎回来</h1>
        <p className="text-gray-500">吉林大学国家卓越工程师学院后台管理系统</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className={`text-4xl font-bold mt-2 ${card.color}`}>
              {loading ? '加载中…' : card.value ?? '—'}
            </p>
          </div>
        ))}
      </div>
      {!loading && Object.values(counts).some((value) => value === null) && (
        <p role="alert" className="text-sm text-amber-700">
          部分统计暂时无法获取，请检查登录状态和 Strapi 接口权限。
        </p>
      )}
    </div>
  );
}