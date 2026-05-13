import PartnerForm from '../_components/PartnerForm';

export default function NewPartnerPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">新增合作单位</h1>
        <p className="text-gray-500 text-sm mt-1">添加新的合作企业或理事单位</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <PartnerForm />
      </div>
    </div>
  );
}
