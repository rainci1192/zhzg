# 吉林大学国家卓越工程师学院（珠海）官网

Next.js 15、React 18 与 Strapi 5 驱动的公开网站。后台管理系统在同级的 `admin/` 项目中。

## 本地运行

安装 Node.js 20 或更新的 LTS 版本，并启动 Strapi 服务，再从本目录执行：

```bash
npm ci
npm run dev
```

官网默认访问 `http://localhost:3000`，Strapi 默认访问 `http://localhost:1337`。发布前使用 `npm run build` 检查生产构建。

## 环境变量

| 名称 | 说明 |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Strapi HTTP 地址，例如 `https://cms.example.edu.cn`；默认 `http://localhost:1337` |
| `NEXT_PUBLIC_MEDIA_ORIGINS` | 如媒体托管在其他站点，填充逗号分隔的完整来源，例如 `https://assets.example.edu.cn` |
| `NEXT_PUBLIC_WEB_URL` | 网站对外地址，用于文章规范链接 |
| `STRAPI_READ_TOKEN` | 服务端读取部分内容的可选只读令牌，不要使用管理令牌 |

媒体来源必须同时配置在 Next.js 图片优化器与媒体地址校验中。令牌只能放在服务器环境，不应使用 `NEXT_PUBLIC_` 前缀。官网文章需要同时满足 Strapi 发布状态和文章审核发布状态。

主要页面位于 `app/`，头部、页脚与导航位于 `components/layout/`，轮播及首页卡片位于 `components/home/`。Strapi 的公开文章查询集中在 `lib/api.ts`，导师等目录内容集中在 `lib/strapi-content.ts`，外部链接与媒体地址校验集中在 `lib/public-urls.ts`。
