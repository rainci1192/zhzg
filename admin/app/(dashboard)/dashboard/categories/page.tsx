'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface Category {
  id: number;
  documentId: string;
  name: string;
  slug?: string;
  level?: number | null;
  sort_order?: number | null;
  is_visible?: boolean | null;
  parentCategory?: { id: number; name: string } | null;
}

interface CategoriesResp {
  data?: Category[];
}

export default function CategoriesPage() {
  const [list, setList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editId, setEditId] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    level: 1,
    sort_order: 0,
    is_visible: true,
    parentId: '',
  });

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = (await api.getCategories('?populate=*&sort=sort_order:asc')) as CategoriesResp;
      setList(res.data || []);
    } catch (e) {
      console.error(e);
      alert('加载分类失败');
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const primaryList = useMemo(
    () => list.filter((c) => !c.parentCategory || c.level === 1),
    [list]
  );

  const secondaryList = useMemo(
    () => list.filter((c) => !!c.parentCategory || c.level === 2),
    [list]
  );

  const resetForm = () => {
    setForm({
      name: '',
      slug: '',
      level: 1,
      sort_order: 0,
      is_visible: true,
      parentId: '',
    });
  };

  const startCreate = () => {
    setEditId(null);
    resetForm();
    setCreating(true);
  };

  const startEdit = (c: Category) => {
    setCreating(false);
    setEditId(c.id);
    setForm({
      name: c.name || '',
      slug: c.slug || '',
      level: c.level === 2 ? 2 : 1,
      sort_order: c.sort_order ?? 0,
      is_visible: c.is_visible ?? true,
      parentId: c.parentCategory?.id ? String(c.parentCategory.id) : '',
    });
  };

  const cancelForm = () => {
    setCreating(false);
    setEditId(null);
    resetForm();
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      alert('请输入分类名称');
      return;
    }
    if (!form.slug.trim()) {
      alert('请输入 slug');
      return;
    }

    if (form.level === 2 && !form.parentId) {
      alert('二级分类必须选择父级');
      return;
    }

    const payload: Record<string, unknown> = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      level: form.level,
      sort_order: Number(form.sort_order) || 0,
      is_visible: form.is_visible,
      parentCategory: form.level === 2 ? Number(form.parentId) : null,
    };

    setSaving(true);
    try {
      if (editId) {
        const target = list.find((x) => x.id === editId);
        if (!target) throw new Error('编辑目标不存在');
        await api.updateCategory(target.documentId || String(target.id), payload);
      } else {
        await api.createCategory(payload);
      }

      cancelForm();
      await fetchList();
    } catch (e) {
      console.error(e);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: Category) => {
    if (!confirm(`确定删除分类「${c.name}」吗？`)) return;

    try {
      await api.deleteCategory(c.documentId || String(c.id));
      await fetchList();
    } catch (e) {
      console.error(e);
      alert('删除失败（可能有文章正在使用该分类）');
    }
  };

  return (
    <div className="space-y-6">
      {/* 顶部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">分类管理</h1>
          <p className="text-gray-500 mt-1">管理一级/二级分类，共 {list.length} 条</p>
        </div>
        <button
          onClick={startCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl"
        >
          <Plus className="w-5 h-5" />
          新增分类
        </button>
      </div>

      {/* 新增/编辑表单 */}
      {(creating || editId !== null) && (
        <div className="bg-white border rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">{editId ? '编辑分类' : '新增分类'}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="border rounded px-3 py-2"
              placeholder="分类名称"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />

            <input
              className="border rounded px-3 py-2"
              placeholder="slug（如：news-research-updates）"
              value={form.slug}
              onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
            />

            <select
              className="border rounded px-3 py-2"
              value={form.level}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  level: Number(e.target.value),
                  parentId: Number(e.target.value) === 1 ? '' : p.parentId,
                }))
              }
            >
              <option value={1}>一级分类</option>
              <option value={2}>二级分类</option>
            </select>

            <input
              type="number"
              className="border rounded px-3 py-2"
              placeholder="排序（越小越靠前）"
              value={form.sort_order}
              onChange={(e) => setForm((p) => ({ ...p, sort_order: Number(e.target.value) }))}
            />

            {form.level === 2 && (
              <select
                className="border rounded px-3 py-2 md:col-span-2"
                value={form.parentId}
                onChange={(e) => setForm((p) => ({ ...p, parentId: e.target.value }))}
              >
                <option value="">请选择父级（一级分类）</option>
                {primaryList.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}

            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_visible}
                onChange={(e) => setForm((p) => ({ ...p, is_visible: e.target.checked }))}
              />
              是否显示
            </label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {saving ? '保存中...' : '保存'}
            </button>
            <button
              onClick={cancelForm}
              className="px-4 py-2 border rounded-lg flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              取消
            </button>
          </div>
        </div>
      )}

      {/* 列表 */}
      <div className="bg-white border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-6 text-gray-500">加载中...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-left">名称</th>
                <th className="p-3 text-left">Slug</th>
                <th className="p-3 text-left">级别</th>
                <th className="p-3 text-left">父级</th>
                <th className="p-3 text-left">排序</th>
                <th className="p-3 text-left">显示</th>
                <th className="p-3 text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {[...primaryList, ...secondaryList].map((c) => (
                <tr key={c.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{c.name}</td>
                  <td className="p-3 text-gray-500">{c.slug || '-'}</td>
                  <td className="p-3">{c.level === 2 ? '二级' : '一级'}</td>
                  <td className="p-3">{c.parentCategory?.name || '-'}</td>
                  <td className="p-3">{c.sort_order ?? 0}</td>
                  <td className="p-3">{c.is_visible ? '是' : '否'}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => startEdit(c)}
                        className="text-blue-600 hover:text-blue-700"
                        title="编辑"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        className="text-red-600 hover:text-red-700"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-400">
                    暂无分类
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
