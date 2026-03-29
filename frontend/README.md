# 吉林大学国家卓越工程师学院(珠海)官网

这是一个基于 Next.js + TypeScript + Tailwind CSS 构建的高校官网前端项目。

## 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **部署**: 可部署到 Vercel、云服务器等

## 快速开始

### 1. 安装依赖

```bash
cd frontend
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### 3. 构建生产版本

```bash
npm run build
npm start
```

## 项目结构

```
frontend/
├── app/                    # Next.js App Router 页面
│   ├── page.tsx           # 首页
│   ├── news/              # 新闻列表页
│   ├── about/intro/       # 学院简介页
│   ├── layout.tsx         # 根布局
│   └── globals.css        # 全局样式
├── components/            # 组件目录
│   ├── layout/           # 布局组件
│   │   ├── Header.tsx    # 导航栏
│   │   └── Footer.tsx    # 页脚
│   └── home/             # 首页组件
│       ├── Banner.tsx    # 轮播图
│       ├── NewsList.tsx  # 新闻列表
│       ├── NoticeList.tsx # 通知公告
│       └── QuickLinks.tsx # 快捷入口
├── public/               # 静态资源
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.mjs
```

## 功能特性

✅ 响应式设计（PC + 移动端）
✅ 顶部导航栏（支持下拉菜单）
✅ 轮播图自动播放
✅ 新闻动态展示
✅ 通知公告列表
✅ 快捷登录入口
✅ 面包屑导航
✅ 二级页面示例

## 页面说明

- **首页** (`/`): 包含轮播图、新闻动态、通知公告、快捷入口
- **学院简介** (`/about/intro`): 二级内容页示例
- **新闻列表** (`/news`): 列表页示例

## 自定义修改

### 修改网站标题和描述

编辑 `app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  title: "你的网站标题",
  description: "你的网站描述",
};
```

### 修改导航菜单

编辑 `components/layout/Header.tsx` 中的 `navItems` 数组

### 修改主题颜色

编辑 `tailwind.config.ts`:

```typescript
colors: {
  primary: "#0066cc",  // 主色调
  secondary: "#003d82", // 辅助色
}
```

### 替换图片

- 轮播图: 修改 `components/home/Banner.tsx` 中的 `slides` 数组
- 新闻图片: 修改 `components/home/NewsList.tsx` 中的 `newsData` 数组
- 将占位图 URL 替换为实际图片路径

## 注意事项

⚠️ **图片替换**: 当前使用的是占位图，请替换为实际图片
⚠️ **数据对接**: 需要对接后端 API 获取真实数据
⚠️ **SEO优化**: 建议添加 sitemap 和 robots.txt

## 下一步工作

1. 对接 Strapi 后端 API
2. 添加更多页面（招生信息、师资队伍等）
3. 实现搜索功能
4. 添加文章详情页
5. 配置生产环境部署

## 常见问题

**Q: 如何修改端口？**
A: 运行 `npm run dev -- -p 3001` 指定端口

**Q: 如何添加新页面？**
A: 在 `app` 目录下创建新文件夹和 `page.tsx` 文件

**Q: 样式不生效？**
A: 确保已安装依赖，重启开发服务器

## 联系方式

如有问题，请联系技术支持。

