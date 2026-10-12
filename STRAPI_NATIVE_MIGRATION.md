# 官网栏目改用 Strapi 原生内容接口

本次按用户上传的 `backend/src/api` 内容类型定义修改了官网，不迁移、删除或更新数据库记录。上传包内已定义 leader、department、supervisor、research-institution、student-document、student-showcase、policy-document、download-file、research-transfer；前端直接请求对应的 Strapi 5 REST 集合接口。旧 `/api/legacy/*` 只读桥已移除。

| 官网栏目 | Strapi REST 集合 |
| --- | --- |
| 现任领导 | `/api/leaders` |
| 机构设置 | `/api/departments` |
| 校内、企业导师 | `/api/supervisors`，按 `category` 过滤 |
| 科研机构 | `/api/research-institutions` |
| 学生管理 | `/api/student-documents` |
| 学生风采 | `/api/student-showcases` |
| 政策文件 | `/api/policy-documents` |
| 资料下载 | `/api/download-files` |
| 成果转化 | `/api/research-transfers` |

## Windows 安装步骤

1. 停止本机的前端和 Strapi 服务。保留现有数据库备份。下载 `strapi_native_migration_overlay.zip` 放到 `E:\zgweb`。若原网站不在 `E:\zgweb`，把下列路径换成实际目录。
2. 在 PowerShell 中备份本次涉及的源码：

   ```powershell
   New-Item -ItemType Directory -Path 'E:\zgweb\strapi-migration-backup' -Force | Out-Null
   Copy-Item -LiteralPath 'E:\zgweb\frontend\app' -Destination 'E:\zgweb\strapi-migration-backup\app' -Recurse -Force
   Copy-Item -LiteralPath 'E:\zgweb\frontend\lib' -Destination 'E:\zgweb\strapi-migration-backup\lib' -Recurse -Force
   Copy-Item -LiteralPath 'E:\zgweb\backend\src\api' -Destination 'E:\zgweb\strapi-migration-backup\api' -Recurse -Force
   ```

3. 将压缩包解压覆盖到项目根目录：

   ```powershell
   Expand-Archive -LiteralPath 'E:\zgweb\strapi_native_migration_overlay.zip' -DestinationPath 'E:\zgweb' -Force
   ```

4. 如果曾安装上一版旧表兼容接口，删除这三个不再使用的文件：

   ```powershell
   Remove-Item -LiteralPath 'E:\zgweb\frontend\lib\legacy.ts' -ErrorAction SilentlyContinue
   Remove-Item -LiteralPath 'E:\zgweb\backend\src\api\custom\controllers\legacy.js' -ErrorAction SilentlyContinue
   Remove-Item -LiteralPath 'E:\zgweb\backend\src\api\custom\routes\legacy.js' -ErrorAction SilentlyContinue
   ```

5. 先启动 Strapi。在 Strapi 管理后台的 **设置 → Users & Permissions plugin → Roles → Public**，给以上内容类型勾选 `find` 并保存。此方案只开放读取已经发布的公开内容；不要勾选 `create`、`update`、`delete`。如果不想开放 Public，可在 **设置 → API Tokens** 创建只读令牌，放在前端项目 `E:\zgweb\frontend\.env.local` 的 `STRAPI_READ_TOKEN=...` 中；令牌不得以 `NEXT_PUBLIC_` 开头，也不要发送到聊天或提交 Git。前端服务端会自动携带令牌。若首次运行时 Strapi 检测到要修改数据库结构，先停下并核对正在连接的数据库和现有备份。
6. 浏览器依次打开上表中的接口，例如 `http://localhost:1337/api/leaders` 和 `http://localhost:1337/api/research-transfers`。应看到 `data` 和 `meta.pagination`。HTTP 403 表示读取权限未配好；HTTP 404 表示内容类型没有加载或服务未重启；`data: []` 则检查记录是否启用、是否已发布，以及 Strapi 是否连接了有真实内容的数据库。带有 Draft & Publish 的类型只有已发布记录会出现在普通 REST 查询中。
7. 打开一个新 PowerShell 窗口运行：

   ```powershell
   cd E:\zgweb\frontend
   npx tsc --noEmit
   npm run build
   npm run dev
   ```

8. 检查上表每个栏目，打开一条导师、科研机构、学生文件、政策文件、成果转化详情，检查图片和附件。成果转化的详情地址现在是 `/research/transfer/文章slug`，先前分享过的 `/article/文章slug?from=transfer` 在找到对应记录时会跳转到新地址。

## 数据字段核对

上传的 Strapi 模型比此前旧 SQL 页面使用的字段更少。导师模型没有 `name_en`、`contact_info`、`education`、`work_experience`、`social_positions`、`research_areas`；科研机构模型没有 `content_html`，目前使用 `summary` 作为详情正文。资料下载由 Strapi 媒体 `file` 提供名称、地址和大小，不再从旧表的 `file_name/file_url/file_size` 取值。若这些字段承载需要保留的真实内容，请补充其 Strapi 模型和一条脱敏后的 REST 响应，再添加对应页面显示。

本地已通过 TypeScript、Next.js 生产构建、上传模型的 JS 语法检查，以及分页、空数据、权限失败、带中文的 slug、媒体 URL 的模拟输入。这里无法连接用户本机的 Strapi 和真实数据库，因此上线前仍需执行第 6、8 步的实际数据核对。
