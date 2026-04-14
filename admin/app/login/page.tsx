'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogin, type LoginResponse } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('🔄 [登录请求] Payload:', { email });

    try {
      const res: LoginResponse = await adminLogin(email, password);
      console.log('✅ [登录成功] JWT 已获取');

      localStorage.setItem('strapi_jwt', res.jwt);
      localStorage.setItem('strapi_user', JSON.stringify(res.user));

      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error 
        ? err.message 
        : '登录失败，请检查邮箱和密码';
      console.error('❌ [登录失败] 详细错误:', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* 品牌区 */}
        <div className="text-center mb-10">
          <div className="mx-auto w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white text-5xl font-bold shadow-xl mb-6">
            吉
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            吉林大学国家卓越工程师学院
          </h1>
          <p className="text-gray-500 mt-2 text-lg">后台管理系统</p>
        </div>

        {/* 卡片 */}
        <div className="bg-white rounded-3xl shadow-2xl p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 邮箱 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                管理员邮箱
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-all text-base"
                placeholder="请输入 Strapi 注册邮箱"
                required
              />
            </div>

            {/* 密码 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-all text-base"
                placeholder="请输入密码"
                required
              />
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-5 py-4 rounded-2xl text-sm">
                {error}
              </div>
            )}

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium text-lg rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
                  登录中...
                </span>
              ) : (
                '立即登录'
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-gray-400">
            仅限学院内部管理员使用 • Powered by Strapi + Next.js
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          v1.0 • 自定义后台管理系统
        </p>
      </div>
    </div>
  );
}
