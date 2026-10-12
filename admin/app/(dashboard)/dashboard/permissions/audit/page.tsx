'use client';

import { useState } from 'react';
import { Search, Filter, Download, Calendar } from 'lucide-react';

interface AuditLog {
  id: number;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  ip: string;
}

export default function PermissionsAuditPage() {
  const [logs] = useState<AuditLog[]>([
    {
      id: 1,
      user: '张三',
      action: '修改角色权限',
      target: '管理员角色 - 文章管理模块',
      timestamp: '2024-01-15 14:30:25',
      ip: '192.168.1.100',
    },
    {
      id: 2,
      user: '李四',
      action: '创建用户',
      target: '用户: 王五',
      timestamp: '2024-01-15 10:20:15',
      ip: '192.168.1.101',
    },
    // 更多日志...
  ]);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">权限审计日志</h1>
          <p className="text-sm text-gray-500 mt-1">查看权限变更和用户操作记录</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Download className="w-4 h-4" />
          导出日志
        </button>
      </div>

      {/* 筛选器 */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索用户或操作..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>所有操作</option>
            <option>创建</option>
            <option>修改</option>
            <option>删除</option>
          </select>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Filter className="w-4 h-4" />
            筛选
          </button>
        </div>
      </div>

      {/* 日志列表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">目标</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP地址</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-600">{log.timestamp}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{log.user}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{log.target}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{log.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
