'use client';

import { Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ROLE_LABELS: Record<string, string> = {
  super_admin: '超级管理员',
  admin: '管理员',
  editor: '编辑',
  reviewer: '审核员',
  article_level1_reviewer: '一级审核',
  article_level2_reviewer: '二级审核',
  level1_reviewer: '一级审核',
  level2_reviewer: '二级审核',
  reviewer_level1: '一级审核',
  reviewer_level2: '二级审核',
  viewer: '查看者',
};

/** Displays the role assigned in Strapi. Role changes must be made by an administrator. */
export default function RoleSwitcher() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
      <Shield className="h-4 w-4" />
      <span>{ROLE_LABELS[user.role] || user.role}</span>
    </div>
  );
}
