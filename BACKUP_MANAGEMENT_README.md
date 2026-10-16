# 备份管理功能

## 功能范围

- 管理后台可手动创建备份，查看状态、大小、执行时间、执行人和 SHA-256 校验值，并下载 `.tar.gz` 归档。
- 支持每天或每周按服务器本地时间定时备份，可选择包含本地 `backend/public/uploads` 媒体文件。
- 成功备份按数量保留（1–100 份）；失败记录保留 30 天。清理、手动/定时备份、配置修改和恢复都会写入现有操作日志。
- 在线恢复前自动创建一份“恢复前安全备份”，校验归档 SHA-256，并要求输入 `RESTORE <备份编号>`。
- 后端 API 根据“备份管理”模块的查看、创建、配置、删除、恢复权限校验；`super_admin` 拥有全部操作。旧版 `manage_backup` 权限兼容查看/创建/配置/删除，不自动赋予恢复权。

## 数据库与媒体支持

| 数据库 | 备份 | 在线恢复 | 依赖 |
| --- | --- | --- | --- |
| PostgreSQL | `pg_dump` 自定义格式 | `pg_restore` | PostgreSQL 客户端工具需在 Strapi 运行环境的 PATH 中 |
| MySQL | `mysqldump` SQL 文件 | `mysql` 导入 | MySQL 客户端工具需在 PATH 中 |
| SQLite | 在线一致性快照 | 需要停止 Strapi 后离线替换数据库文件 | 无额外命令行依赖 |

本项目当前上传配置为 Strapi 默认本地文件存储。若改成 S3 等远程对象存储，归档不会自动拉取云端对象；请在云存储服务中启用对象版本控制/独立备份，并启动 Strapi 时设置 `BACKUP_UPLOAD_PROVIDER=s3`（或实际 provider 名称），让控制台显示媒体未包含提示。

## 安装与启用

1. 将补丁文件复制到项目对应路径。安装前备份当前项目和数据库。
2. 在 `backend` 目录运行 `npm install`，以安装/校准 `tar` 归档依赖。
3. 确认 PostgreSQL 环境能在命令行运行 `pg_dump --version` 和 `pg_restore --version`；MySQL 环境确认 `mysqldump --version` 和 `mysql --version`。SQLite 不需要这些工具。
4. 启动 Strapi。新权限模块与操作项会在启动时登记。到“角色管理”给需要的角色分配“备份管理”权限：查看、创建、配置、删除；只有可信管理员才分配“恢复”。
5. 用这些角色登录管理后台，进入“备份管理”，先执行一次手动备份并下载归档验证。
6. 保存定时策略。Strapi 必须持续运行，定时任务才会触发；多实例部署时应只在一个实例启用此任务，避免重复备份。

默认备份路径为 `backend/backups`（已加入 `.gitignore`）。可通过 `BACKUP_STORAGE_DIR` 改到非 Web 可访问目录，例如 `E:\zgweb-backups`。备份文件包含网站数据库和媒体文件，应限制磁盘目录访问并定期复制到异地存储；“备份成功”不等于异地容灾完成。

## SQLite 离线恢复

1. 下载并解压该 `.tar.gz` 备份归档。
2. 停止 Strapi；先复制当前 SQLite 数据库文件和 `backend/public/uploads` 作额外安全副本。
3. 将归档中的 `database.sqlite` 替换 `backend/.tmp/data.db`（如果 `DATABASE_FILENAME` 指向别处，则替换实际配置文件）；将归档 `uploads` 覆盖 `backend/public/uploads`。
4. 重新启动 Strapi，检查后台登录、文章列表、媒体图片和官网页面。

## 安全说明

数据库备份通常包含用户、内容和密码哈希等敏感数据。请将备份目录放在非公开目录、限制服务器账户权限，并另行设置加密磁盘或加密异地存储。恢复会替换线上数据，恢复权限应只分配给可信角色。
