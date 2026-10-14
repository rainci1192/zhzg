# 后台真实登录修复说明

## 修改内容

- 登录页使用 Strapi Users & Permissions 的真实登录接口验证邮箱和密码。
- 登录后调用 `/api/users/me` 验证 JWT，再按相同邮箱读取 `backend-admins` 资料。
- 只有资料处于启用状态且已分配有效后台角色的账号才能进入后台。
- 移除本地自动创建的“超级管理员”演示身份；旧 `auth_user` 缓存会被清理。
- 页面刷新时重新向 Strapi 验证登录令牌和管理员资料。
- 后台页面增加登录保护；退出时清除真实登录令牌。
- 移除前端角色切换，顶部显示当前账号身份。
- 不再把密码写入浏览器控制台。

## 覆盖步骤

1. 先备份电脑上的 `E:\zgweb\admin` 文件夹。
2. 将此 ZIP 解压到 `E:\zgweb`，选择“覆盖目标中的文件”。ZIP 中保留了 `admin/...` 目录结构。
3. 在 PowerShell 执行：

   ```powershell
   cd E:\zgweb\admin
   npx tsc --noEmit
   npm run dev
   ```

4. 打开后台登录页，用现有 Strapi 用户与密码登录。退出后，再直接访问 `http://localhost:3000/dashboard`，应返回登录页。

## 登录账号必须满足的条件

后台使用两类互相关联的记录：

1. Strapi 管理后台的 **Users & Permissions 用户**：邮箱和密码用于真实验证。
2. 官网后台的 **Backend Admin** 记录：邮箱必须与第 1 项完全相同，且 `is_active` 为启用状态，并分配 `backend_role`。

这两项中的邮箱不一致、Backend Admin 记录不存在、账号停用或角色缺失，登录都会被拒绝。原有后台“用户管理”页面只维护 Backend Admin 资料，不会自动创建 Users & Permissions 登录账号；请在 Strapi 的 Users & Permissions 用户管理中先建立真实登录账号。

## 重要权限边界

此改动修复身份验证、后台页面入口保护和前端角色伪造问题。现有角色菜单和模块权限仍有一部分只在浏览器端控制；Strapi 内容 API 的服务端权限必须继续单独核验并配置，不能把隐藏菜单当成 API 授权。上线前应验证不同 Users & Permissions 角色不能直接调用其无权访问的 Strapi 内容接口。
