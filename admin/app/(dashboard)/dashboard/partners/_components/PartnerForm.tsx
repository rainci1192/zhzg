'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { createPartner, updatePartner, uploadLogo, toAbsoluteUrl, type Partner, type PartnerPayload } from '@/lib/api/partners';
import { uploadFile } from '@/lib/api';

const WordLikeEditor = dynamic(() => import('@/components/editor/WordLikeEditor'), { ssr: false });

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

interface UploadedFile {
  id: number;
  url: string;
}

type Props = { initialData?: Partner };

export default function PartnerForm({ initialData }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = !!initialData;

  const [form, setForm] = useState({
    name: initialData?.name ?? '',
    intro: initialData?.intro ?? '',
    website: initialData?.website ?? '',
    is_active: initialData?.is_active ?? true,
    is_council: initialData?.is_council ?? false,
    sort_order: initialData?.sort_order ?? 0,
  });

  const initialLogoUrl = initialData?.logo ? toAbsoluteUrl(initialData.logo.url) : '';
  const [logoPreview, setLogoPreview] = useState<string>(initialLogoUrl);
  const [logoFileId, setLogoFileId] = useState<number | null>(initialData?.logo?.id ?? null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoPreview(URL.createObjectURL(file));
    e.target.value = '';
    setUploading(true); setError('');
    try {
      const uploaded = await uploadLogo(file);
      setLogoFileId(uploaded.id);
      setLogoPreview(uploaded.url);
    } catch (err: unknown) {
      setError('Logo 上传失败：' + (err instanceof Error ? err.message : String(err)));
      setLogoPreview(initialLogoUrl);
    } finally { setUploading(false); }
  }

  const handleEditorUpload = async (file: File): Promise<string> => {
    const uploaded = (await uploadFile(file)) as UploadedFile[];
    const url = uploaded?.[0]?.url || '';
    return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError('企业名称不能为空'); return; }
    setError(''); setSaving(true);
    try {
      const payload: PartnerPayload = {
        name: form.name.trim(),
        intro: form.intro.trim() || undefined,
        website: form.website.trim() || undefined,
        is_active: form.is_active,
        is_council: form.is_council,
        sort_order: Number(form.sort_order),
        logo: logoFileId,
      };
      if (isEdit) await updatePartner(initialData!.documentId, payload);
      else await createPartner(payload);
      router.push('/dashboard/partners');
      router.refresh();
    } catch (err: unknown) {
      setError('保存失败：' + (err instanceof Error ? err.message : String(err)));
    } finally { setSaving(false); }
  }

  const isBusy = uploading || saving;

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <Field label="企业名称" required>
        <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="请输入企业名称" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </Field>

      <Field label="企业 Logo">
        <div className="flex items-start gap-4">
          <div className="w-32 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden cursor-pointer hover:border-blue-400 transition-colors flex-shrink-0 relative" onClick={() => fileInputRef.current?.click()}>
            {logoPreview ? (
              <Image src={logoPreview} alt="logo预览" fill className="object-contain p-2" unoptimized />
            ) : (
              <div className="text-center text-gray-400 text-xs"><div className="text-2xl mb-1">🖼</div>点击上传</div>
            )}
          </div>
          <div className="flex flex-col gap-2 justify-center">
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
              {uploading ? '上传中…' : logoPreview ? '更换图片' : '选择图片'}
            </button>
            {logoPreview && (
              <button type="button" onClick={() => { setLogoPreview(''); setLogoFileId(null); }} className="px-4 py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">移除图片</button>
            )}
            <p className="text-xs text-gray-400">支持 PNG / JPG / SVG，建议宽高比 3:2</p>
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
      </Field>

      <Field label="企业简介">
        <WordLikeEditor
          value={form.intro}
          onChange={(html) => setForm({ ...form, intro: html })}
          uploadImage={handleEditorUpload}
        />
      </Field>

      <Field label="企业网址">
        <input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://example.com（选填）" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </Field>

      <Field label="排序权重">
        <input type="number" value={form.sort_order} min={0} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <p className="text-xs text-gray-400 mt-1">数字越小越靠前，默认为 0</p>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <ToggleField label="是否理事单位" description="勾选后将显示在理事会成员列表" checked={form.is_council} onChange={(v) => setForm({ ...form, is_council: v })} />
        <ToggleField label="启用显示" description="关闭后不在前台展示" checked={form.is_active} onChange={(v) => setForm({ ...form, is_active: v })} />
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
        <button type="submit" disabled={isBusy} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50">
          {saving ? '保存中…' : isEdit ? '保存修改' : '创建单位'}
        </button>
        <button type="button" onClick={() => router.back()} className="px-6 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm">取消</button>
      </div>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      {children}
    </div>
  );
}

function ToggleField({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg">
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors focus:outline-none ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}>
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform mt-0.5 ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
      <div><p className="text-sm font-medium text-gray-700">{label}</p><p className="text-xs text-gray-400 mt-0.5">{description}</p></div>
    </div>
  );
}
