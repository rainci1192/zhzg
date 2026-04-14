export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">欢迎回来</h1>
        <p className="text-gray-500">吉林大学国家卓越工程师学院后台管理系统</p>
      </div>

      {/* 临时统计卡片（后续可扩展） */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-400">已发布文章</p>
          <p className="text-4xl font-bold text-blue-600 mt-2">128</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-400">待审核内容</p>
          <p className="text-4xl font-bold text-amber-600 mt-2">12</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-400">栏目总数</p>
          <p className="text-4xl font-bold text-emerald-600 mt-2">18</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-400">今日访问</p>
          <p className="text-4xl font-bold text-purple-600 mt-2">2.4k</p>
        </div>
      </div>

      <p className="text-sm text-gray-400">
        登录成功 ✅ 现在你可以继续开发左侧菜单的其他页面了
      </p>
    </div>
  );
}
