'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchRoles, clearRolesCache } from '@/lib/permissions';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

interface User {
  id: string;
  documentId?: string;
  name: string;
  username: string;
  email: string;
  role: string;
  roleId?: number;
  avatar?: string;
  is_active?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserRole: (roleId: number, roleName: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化：从 localStorage 加载用户信息并获取角色数据
  useEffect(() => {
    const loadUser = async () => {
      try {
        // 先加载角色数据
        await fetchRoles();

        const savedUser = localStorage.getItem('auth_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        } else {
          // 默认用户（用于演示）
          const defaultUser: User = {
            id: '1',
            name: '超级管理员',
            // cspell:disable-next-line
            username: 'superadmin',
            email: 'super@example.com',
            role: 'super_admin',
          };
          setUser(defaultUser);
          localStorage.setItem('auth_user', JSON.stringify(defaultUser));
        }
      } catch (error) {
        console.error('加载用户信息失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // 调用 Strapi API 登录
      const response = await fetch(
        `${STRAPI_URL}/api/backend-admins?filters[email][$eq]=${email}&populate=backend_role`
      );
      const data = await response.json();

      if (data.data && data.data.length > 0) {
        const userData = data.data[0];
        
        // TODO: 实际项目中应该验证密码
        // 这里只是演示，实际应该调用 Strapi 的认证 API
        console.log('登录密码:', password);

        // 检查用户是否被禁用
        if (!userData.is_active) {
          throw new Error('账户已被禁用');
        }

        const newUser: User = {
          id: userData.id.toString(),
          documentId: userData.documentId,
          name: userData.name,
          username: userData.username,
          email: userData.email,
          role: userData.backend_role?.name || 'viewer',
          roleId: userData.backend_role?.id,
          avatar: userData.avatar?.url,
          is_active: userData.is_active,
        };

        setUser(newUser);
        localStorage.setItem('auth_user', JSON.stringify(newUser));

        // 更新最后登录时间
        await fetch(`${STRAPI_URL}/api/backend-admins/${userData.documentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: {
              last_login: new Date().toISOString(),
            },
          }),
        });
      } else {
        throw new Error('用户不存在');
      }
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  const updateUserRole = (roleId: number, roleName: string) => {
    if (user) {
      const updatedUser = { ...user, role: roleName, roleId };
      setUser(updatedUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      clearRolesCache(); // 清除缓存以重新加载权限
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUserRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
