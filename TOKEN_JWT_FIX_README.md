# Strapi 令牌安全修复包

## 本包做了什么
- 后台请求统一附带浏览器中管理员登录时保存的 `strapi_jwt`。
- 文件上传使用登录 JWT，正确保留 multipart 边界。
- 后台理事会、领导和合作单位代码不再读取 Strapi API Token。
- 官网服务端页面只读取服务端变量 `STRAPI_API_TOKEN`，移除了 `NEXT_PUBLIC_STRAPI_API_TOKEN`。
- 合作单位编辑页在浏览器中加载数据，以便使用管理员 JWT。

## 在 Windows 上应用
1. 先备份 `E:\zgweb`，至少复制 `admin` 和 `frontend` 两个文件夹。
2. 将本压缩包解压到 `E:\zgweb`，选择覆盖同名文件。压缩包内路径已从项目根目录开始。
3. 在部署平台和本地 `.env` 文件中删除 `NEXT_PUBLIC_STRAPI_API_TOKEN`。不要在 `admin` 项目中设置任何 Strapi API Token。
4. 如果官网读取接口仍需要 API Token，把新建的 **Read-only** Token 放入官网服务的服务端环境变量 `STRAPI_API_TOKEN`。不要把它改成 `NEXT_PUBLIC_` 开头。
5. 重新构建并部署前台和后台。Next.js 的公开变量在构建时被写入浏览器文件，改环境变量后必须重新构建。
6. 更新后登录后台测试：列表、编辑、删除、图片/附件上传。若看到 403，请检查 Strapi 登录用户角色对相应 Content API 的权限；不要开放 Public 写权限。

## 检查状态
共享请求函数已用 Node 测过：有 JWT、无 JWT、自定义 Authorization、JSON 请求体、FormData 上传。
此审查副本没有安装项目依赖，因此无法在这里运行 `npx tsc --noEmit`。应用后请在 `admin` 和 `frontend` 目录分别运行类型检查。
