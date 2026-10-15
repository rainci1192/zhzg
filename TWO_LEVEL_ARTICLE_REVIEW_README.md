# 文章二级审核补丁

这份补丁把文章流程改为：

`发布者保存草稿 → 选择一级审核人员 → 一级审核 → 二级审核 → 发布者最终发布`

审核动作由后端接口校验当前登录账号和文章状态，不能再通过普通文章 `PUT` 请求直接把状态改成已发布。

## 安装

1. 先停止 Strapi 和 `admin` 的开发/生产进程。
2. 备份以下目录和文件：
   - `backend/src/api/article`
   - `backend/src/api/review-log`
   - `backend/src/index.js`
   - `admin/app/(dashboard)/dashboard/articles/page.tsx`
   - `admin/app/(dashboard)/dashboard/review/page.tsx`
   - `admin/app/(dashboard)/dashboard/page.tsx`
   - `admin/lib/api.ts`
   - `admin/components/RoleSwitcher.tsx`
   - `admin/components/layout/Sidebar.tsx`
   - `admin/lib/permissions.ts`
3. 将压缩包直接解压到项目根目录 `E:\zgweb`，出现覆盖提示时选择替换。
4. 启动 Strapi 一次，让新增字段和两个系统角色完成初始化；再启动管理后台。

本修正版把审核路由绑定到已有的文章 `find` / `update` Content API 权限，避免新增自定义路由被按未授权动作拦截。启动时会补齐 `articles` 权限模块、`view` / `review` 操作，并修复历史上 `permission_module` 为空的文章角色权限记录。

## 角色配置

Strapi 启动时会自动创建两个角色：

| 角色名称（系统值） | 显示名称 | 作用 |
| --- | --- | --- |
| `article_level1_reviewer` | 一级审核 | 审核被指定到自己的文章，决定进入二级审核或退回 |
| `article_level2_reviewer` | 二级审核 | 审核进入二级审核的文章，决定通过或退回 |

进入自定义后台的“用户管理”，给相应用户分配这两个角色。一级审核人员超过一人时，发布者提交文章会在弹窗中选择其中一人；只有启用的一级审核角色账号会出现在列表中。

如果你的安装没有现成的细粒度权限记录，请在“角色管理 → 配置权限”中给两个新角色至少配置 `articles` 模块的 `view` 和 `review`。启动初始化会在已有 `articles` 模块和 `view/review` 操作记录存在时自动写入这项配置。

原来的 `reviewer` 角色不会自动判断为一级或二级。请把原审核用户按职责改分配到“一级审核”或“二级审核”；如果一个用户需要承担两级审核，只能通过账号分别配置或由管理员按实际职责安排。

## 流程说明

- 发布者新增或编辑文章后，点击“提交一级审核”，选择一级审核人员。
- 一级审核通过后，文章状态变为“待二级审核”，任意启用的二级审核角色都可以处理。
- 二级审核通过后，文章状态变为“待发布者发布”，只有原发布者能点击“发布”。
- 任一审核退回都会回到发布者可编辑的状态，并保留退回原因。
- 旧的 `pending_admin`、`pending_leader`、`approved` 状态仍可由新角色继续处理，便于升级已有数据；新文章统一使用 `pending_level1`、`pending_level2` 和 `approved_pending_publish`。

## 验证顺序

1. 用编辑账号保存一篇草稿并提交，确认可选择一级审核人员。
2. 用被选中的一级审核账号登录，确认只能处理指定给自己的文章。
3. 一级通过后，用二级审核账号登录并通过。
4. 回到原发布者账号，确认只有它能发布；其他账号调用发布接口会被拒绝。
5. 用一级或二级审核账号尝试直接修改文章 `review_status`，应收到“只能通过文章审核流程操作”的错误。
