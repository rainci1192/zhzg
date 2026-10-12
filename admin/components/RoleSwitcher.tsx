'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchRoles, StrapiRole } from '@/lib/permissions';
import { Shield, ChevronDown } from 'lucide-react';

export default function RoleSwitcher() {
  const { user, updateUserRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [roles, setRoles] = useState<StrapiRole[]>([]);

  useEffect(() => {
    const loadRoles = async () => {
      const rolesData = await fetchRoles();
      setRoles(rolesData);
    };
    loadRoles();
  }, []);

  if (!user) return null;

  const currentRole = roles.find((r) => r.name === user.role);

  const getRoleColor = (color: string) => {
    const colorMap: Record<string, string> = {
      purple: 'text-purple-600',
      blue: 'text-blue-600',
      green: 'text-green-600',
      orange: 'text-orange-600',
      gray: 'text-gray-600',
    };
    return colorMap[color] || 'text-gray-600';
  };

  const handleRoleChange = (roleId: number, roleName: string) => {
    updateUserRole(roleId, roleName);
    setIsOpen(false);
    
    // ✅ 刷新页面以重新加载权限
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Shield className="w-4 h-4" />
        <span className="text-sm font-medium">
          {currentRole?.display_name || '未知角色'}
        </span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 right-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => handleRoleChange(role.id, role.name)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  user.role === role.name ? 'bg-blue-50 font-medium' : ''
                } ${getRoleColor(role.color)}`}
              >
                {role.display_name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
