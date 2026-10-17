'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { adminLogin } from '@/lib/api';
import { strapiFetch } from '@/lib/strapi-fetch';
import { clearPermissionsCache } from '@/lib/permissions';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export interface User {
  id: string;
  documentId: string;
  name: string;
  username: string;
  email: string;
  role: string;
  roleId: number;
  avatar?: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

interface StrapiRecord extends Record<string, unknown> {
  id?: number | string;
  documentId?: string;
  attributes?: Record<string, unknown>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function clearStoredSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem('strapi_jwt');
  window.localStorage.removeItem('strapi_user');
  // Remove the old demo session so it can never be reused as an identity.
  window.localStorage.removeItem('auth_user');
  clearPermissionsCache();
}

function unwrapRecord(value: unknown): StrapiRecord | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as StrapiRecord;
  if (record.attributes && typeof record.attributes === 'object') {
    return { ...record.attributes, id: record.id, documentId: record.documentId };
  }
  return record;
}

function unwrapRelation(value: unknown): StrapiRecord | null {
  if (!value || typeof value !== 'object') return null;
  const relation = value as { data?: unknown };
  return unwrapRecord(relation.data ?? value);
}

async function fetchCurrentAdmin(): Promise<User> {
  const identityResponse = await strapiFetch(`${STRAPI_URL}/api/users/me?populate=role`);
  if (!identityResponse.ok) {
    throw new Error('登录状态已失效，请重新登录。');
  }

  const identity = (await identityResponse.json()) as {
    id?: number | string;
    username?: string;
    email?: string;
  };
  const email = identity.email?.trim();
  if (!email) {
    throw new Error('Strapi 未返回有效的账号邮箱，请联系管理员检查账号。');
  }

  const profileUrl =
    `${STRAPI_URL}/api/backend-admins` +
    `?filters[email][$eq]=${encodeURIComponent(email)}` +
    '&populate[backend_role]=true&populate[avatar]=true';
  const profileResponse = await strapiFetch(profileUrl);
  if (!profileResponse.ok) {
    throw new Error(`无法读取后台管理员资料（HTTP ${profileResponse.status}），请联系管理员检查 Strapi API 权限。`);
  }

  const profileResult = (await profileResponse.json()) as { data?: unknown[] };
  const profile = unwrapRecord(profileResult.data?.[0]);
  if (!profile) {
    throw new Error('此 Strapi 账号尚未关联后台管理员资料，请联系管理员完成账号绑定。');
  }

  const profileEmail = String(profile.email ?? '').trim().toLowerCase();
  if (profileEmail !== email.toLowerCase()) {
    throw new Error('后台管理员邮箱与 Strapi 登录账号不一致，请联系管理员检查账号绑定。');
  }

  if (profile.is_active !== true) {
    throw new Error('此后台账号已停用，请联系管理员。');
  }

  const role = unwrapRelation(profile.backend_role);
  const roleId = Number(role?.id);
  const roleName = typeof role?.name === 'string' ? role.name : '';
  if (!Number.isFinite(roleId) || roleId <= 0 || !roleName) {
    throw new Error('此后台账号尚未分配有效角色，请联系管理员。');
  }

  const avatar = unwrapRelation(profile.avatar);
  const avatarUrl = typeof avatar?.url === 'string' ? avatar.url : undefined;

  return {
    id: String(profile.id ?? identity.id ?? ''),
    documentId: String(profile.documentId ?? ''),
    name: String(profile.name ?? identity.username ?? email),
    username: String(profile.username ?? identity.username ?? email),
    email,
    role: roleName,
    roleId,
    avatar: avatarUrl,
    is_active: true,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const token = window.localStorage.getItem('strapi_jwt');
      // Never trust the old locally stored demo identity.
      window.localStorage.removeItem('auth_user');

      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await fetchCurrentAdmin();
        if (!cancelled) setUser(currentUser);
      } catch (error) {
        console.error('恢复后台登录状态失败:', error);
        clearStoredSession();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await adminLogin(email.trim(), password);
      window.localStorage.setItem('strapi_jwt', response.jwt);
      window.localStorage.setItem('strapi_user', JSON.stringify(response.user));

      const currentUser = await fetchCurrentAdmin();
      setUser(currentUser);

      // Last-login tracking is useful, but a logging failure should not undo a valid login.
      if (currentUser.documentId) {
        try {
          await strapiFetch(`${STRAPI_URL}/api/backend-admins/${currentUser.documentId}`, {
            method: 'PUT',
            body: JSON.stringify({ data: { last_login: new Date().toISOString() } }),
          });
        } catch (error) {
          console.warn('更新最后登录时间失败:', error);
        }
      }
    } catch (error) {
      clearStoredSession();
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearStoredSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
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
