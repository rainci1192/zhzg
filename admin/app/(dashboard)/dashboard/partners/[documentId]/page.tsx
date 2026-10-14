'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PartnerForm from '../_components/PartnerForm';
import { fetchPartner, type Partner } from '@/lib/api/partners';

export default function EditPartnerPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadPartner() {
      setLoading(true);
      setErrorMsg('');
      try {
        const result = await fetchPartner(documentId);
        if (!cancelled) setPartner(result);
      } catch (error: unknown) {
        if (!cancelled) {
          setErrorMsg(error instanceof Error ? error.message : String(error));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (documentId) void loadPartner();
    return () => {
      cancelled = true;
    };
  }, [documentId]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">编辑合作单位</h1>
        <p className="text-gray-500 text-sm mt-1">
          {partner ? `正在编辑：${partner.name}` : '加载合作单位信息'}
        </p>
      </div>
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-gray-500">
          正在加载…
        </div>
      ) : errorMsg ? (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3">
          加载失败：{errorMsg}
        </div>
      ) : partner ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <PartnerForm initialData={partner} />
        </div>
      ) : null}
    </div>
  );
}
