备份目录修复补丁

安装：将压缩包解压到项目根目录 E:\zgweb，保持覆盖目录结构。唯一覆盖的文件是：
backend\src\api\backup-management\services\backup-management.js

补丁默认将备份写入项目目录的同级目录。例如项目 E:\zgweb，备份目录为 E:\zgweb-backups。它也会在开始手动备份前检查 pg_dump 是否可运行。

如果存在 BACKUP_STORAGE_DIR 环境变量，它会覆盖默认值。将其改为项目目录外的路径，例如 E:/zgweb-backups，或删除该设置。用户级/系统级 Windows 环境变量也需要检查。

覆盖后重启 Strapi。确认备份日志中的 File created 路径以 E:\zgweb-backups\ 开头。
