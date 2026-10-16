自定义后台管理系统安全审查补丁

基线：GitHub main 74bd6efb67b917755e5a8f4bd1a1f1689c309e2e

安装：将压缩包解压到项目根目录 E:\zgweb，并覆盖同名代码文件。保留已有 .env，不要用示例文件覆盖。随后分别在 backend、admin、frontend 目录运行 npm ci；启动 Strapi 和 Next.js 后按 SECURITY_REVIEW.md 的角色清单验证。

如需 Git 补丁格式，也可用同轮提供的 custom-admin-security-review.patch，从项目根目录执行 git apply。

补丁包含代码和依赖文件 55 个，另附安全审查报告。
