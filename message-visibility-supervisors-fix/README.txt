补丁内容

1. 文章列表审核意见（消息）按钮只对超级管理员、文章发布者、该文章指定的一级审核人和二级审核人显示。
2. 导师管理页将 'use client' 移到文件首行，修复 Next.js Server Component 不允许 dynamic(..., { ssr: false }) 的编译错误。

应用方式

将压缩包内 admin 目录合并覆盖到项目 admin 目录。覆盖前建议备份以下两个文件：
- admin/app/(dashboard)/dashboard/articles/page.tsx
- admin/app/(dashboard)/dashboard/supervisors/page.tsx

覆盖后重启 Next.js 开发服务器并检查文章消息显示权限、导师管理页加载。
