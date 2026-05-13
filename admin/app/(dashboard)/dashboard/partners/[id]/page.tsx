import PartnerForm from '../_components/PartnerForm';
import { fetchPartner } from '@/lib/api/partners';

export default async function EditPartnerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  let partner = null;
  let errorMsg = '';

  try {
    partner = await fetchPartner(id);
  } catch (e: unknown) {
    errorMsg = e instanceof Error ? e.message : String(e);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">编辑合作单位</h1>
        <p className="text-gray-500 text-sm mt-1">
          {partner ? `正在编辑：${partner.name}` : '加载中...'}
        </p>
      </div>
      {errorMsg ? (
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
