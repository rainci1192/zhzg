'use strict';

const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');
const tar = require('tar');
const { createCoreService } = require('@strapi/strapi').factories;

const DEFAULT_SETTINGS = {
  enabled: false,
  frequency: 'daily',
  time: '02:00',
  weekday: 1,
  retentionCount: 14,
  includeMedia: true,
  lastScheduledKey: '',
};

function safeId(value) {
  return /^[a-zA-Z0-9_-]{1,100}$/.test(String(value || '')) ? String(value) : null;
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { windowsHide: true, ...options });
    let stderr = '';
    child.stderr?.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('error', (error) => {
      if (error.code === 'ENOENT') {
        reject(new Error(`${command} 未安装或不在 PATH 中，请安装数据库客户端工具并重启 Strapi。`));
      } else reject(error);
    });
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} 失败（退出码 ${code}）：${stderr.trim().slice(-1500) || '无详细错误信息'}`));
    });
  });
}

function importSql(command, args, inputFile, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { windowsHide: true, ...options });
    let stderr = '';
    const input = require('fs').createReadStream(inputFile);
    input.pipe(child.stdin);
    child.stderr?.on('data', (chunk) => { stderr += chunk.toString(); });
    input.on('error', reject);
    child.on('error', (error) => reject(error.code === 'ENOENT' ? new Error(`${command} 未安装或不在 PATH 中，请安装数据库客户端工具并重启 Strapi。`) : error));
    child.on('close', (code) => code === 0 ? resolve() : reject(new Error(`${command} 数据导入失败（退出码 ${code}）：${stderr.trim().slice(-1500) || '无详细错误信息'}`)));
  });
}

async function walkFiles(directory, prefix = '') {
  const items = await fs.readdir(directory, { withFileTypes: true }).catch(() => []);
  const files = [];
  for (const item of items) {
    const relative = path.join(prefix, item.name);
    if (item.isDirectory()) files.push(...await walkFiles(path.join(directory, item.name), relative));
    else if (item.isFile()) files.push(relative);
  }
  return files;
}

module.exports = createCoreService('api::backup-management.backup-management', ({ strapi }) => {
  const appRoot = path.resolve(__dirname, '../../../../');
  const dataRoot = path.resolve(process.env.BACKUP_STORAGE_DIR || path.join(appRoot, 'backups'));
  const settingsFile = path.join(dataRoot, 'settings.json');
  const lockDir = path.join(dataRoot, '.backup-running');
  let activeRun = null;

  async function ensureRoot() {
    await fs.mkdir(dataRoot, { recursive: true, mode: 0o700 });
  }

  async function lockIsActive() {
    const stat = await fs.stat(lockDir).catch(() => null);
    if (!stat) return false;
    const pid = Number.parseInt(await fs.readFile(lockDir, 'utf8').catch(() => ''), 10);
    if (Number.isInteger(pid) && pid > 0) {
      try { process.kill(pid, 0); return true; }
      catch (error) {
        if (error.code === 'EPERM') return true;
        if (error.code === 'ESRCH') {
          await fs.rm(lockDir, { force: true }).catch(() => {});
          return false;
        }
      }
    }
    // Recover a stale marker left behind if the Strapi process was terminated.
    if (Date.now() - stat.mtimeMs > 48 * 60 * 60 * 1000) {
      await fs.rm(lockDir, { force: true }).catch(() => {});
      return false;
    }
    return true;
  }

  async function readSettings() {
    await ensureRoot();
    try {
      const saved = JSON.parse(await fs.readFile(settingsFile, 'utf8'));
      return { ...DEFAULT_SETTINGS, ...saved };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  async function writeSettings(settings) {
    await ensureRoot();
    const temporary = `${settingsFile}.${process.pid}.tmp`;
    await fs.writeFile(temporary, JSON.stringify(settings, null, 2), { mode: 0o600 });
    await fs.rename(temporary, settingsFile);
  }

  function dbConfig() {
    return strapi.config.get('database.connection') || {};
  }

  function dbClient() {
    return String(dbConfig().client || process.env.DATABASE_CLIENT || 'sqlite').toLowerCase();
  }

  function databaseName() {
    const connection = dbConfig().connection || {};
    if (connection.connectionString || process.env.DATABASE_URL) {
      try { return new URL(connection.connectionString || process.env.DATABASE_URL).pathname.replace(/^\//, '') || 'database'; }
      catch { return 'database'; }
    }
    return connection.database || process.env.DATABASE_NAME || 'database';
  }

  async function dumpDatabase(folder) {
    const config = dbConfig();
    const connection = config.connection || {};
    const client = dbClient();
    if (client === 'postgres' || client === 'postgresql') {
      const dumpFile = path.join(folder, 'database.dump');
      const args = ['--format=custom', '--no-owner', '--no-privileges', '--file', dumpFile];
      const options = { env: { ...process.env } };
      const urlString = connection.connectionString || process.env.DATABASE_URL;
      if (urlString) {
        const url = new URL(urlString);
        args.push('--host', url.hostname, '--port', url.port || '5432', '--username', decodeURIComponent(url.username), '--dbname', decodeURIComponent(url.pathname.replace(/^\//, '')));
        if (url.password) options.env.PGPASSWORD = decodeURIComponent(url.password);
        const sslmode = url.searchParams.get('sslmode');
        if (sslmode) options.env.PGSSLMODE = sslmode;
      } else {
        args.push('--host', String(connection.host || 'localhost'), '--port', String(connection.port || 5432), '--username', String(connection.user || 'postgres'), '--dbname', String(connection.database || 'postgres'));
        if (connection.password) options.env.PGPASSWORD = String(connection.password);
        if (connection.ssl) options.env.PGSSLMODE = 'require';
      }
      await runCommand(process.env.PG_DUMP_PATH || 'pg_dump', args, options);
      return { client: 'postgres', file: 'database.dump', restoreSupported: true };
    }

    if (client === 'mysql' || client === 'mysql2') {
      const dumpFile = path.join(folder, 'database.sql');
      const args = ['--single-transaction', '--routines', '--triggers', '--events', '--add-drop-table', '--host', String(connection.host || 'localhost'), '--port', String(connection.port || 3306), '--user', String(connection.user || 'root'), String(connection.database || 'strapi')];
      const options = { env: { ...process.env } };
      if (connection.password) options.env.MYSQL_PWD = String(connection.password);
      const output = require('fs').createWriteStream(dumpFile, { mode: 0o600 });
      await new Promise((resolve, reject) => {
        const child = spawn(process.env.MYSQLDUMP_PATH || 'mysqldump', args, { ...options, windowsHide: true });
        let stderr = '';
        child.stdout.pipe(output);
        child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
        child.on('error', (error) => reject(error.code === 'ENOENT' ? new Error('mysqldump 未安装或不在 PATH 中，请安装 MySQL 客户端工具并重启 Strapi。') : error));
        child.on('close', (code) => code === 0 ? resolve() : reject(new Error(`mysqldump 失败（退出码 ${code}）：${stderr.trim().slice(-1500)}`)));
        output.on('error', reject);
      });
      return { client: 'mysql', file: 'database.sql', restoreSupported: true };
    }

    if (client === 'sqlite' || client === 'better-sqlite3') {
      const configuredFile = connection.filename;
      if (!configuredFile || configuredFile === ':memory:') throw new Error('当前 SQLite 数据库没有可备份的本地文件路径。');
      const sourceFile = path.isAbsolute(configuredFile) ? configuredFile : path.resolve(appRoot, configuredFile);
      if (!(await fs.stat(sourceFile).catch(() => null))) throw new Error(`SQLite 数据库文件不存在：${sourceFile}`);
      const outputFile = path.join(folder, 'database.sqlite');
      await fs.mkdir(path.dirname(outputFile), { recursive: true });
      const escaped = outputFile.replace(/'/g, "''");
      await strapi.db.connection.raw(`VACUUM INTO '${escaped}'`);
      return { client: 'sqlite', file: 'database.sqlite', restoreSupported: false };
    }
    throw new Error(`暂不支持数据库类型 ${client} 的备份。`);
  }

  async function copyUploads(folder, includeMedia) {
    const uploadRoot = path.join(appRoot, 'public', 'uploads');
    if (!includeMedia) return { included: false, provider: 'local', files: 0 };
    const provider = String(process.env.BACKUP_UPLOAD_PROVIDER || 'local').toLowerCase();
    if (provider !== 'local') return { included: false, provider, files: 0, note: '远程对象存储需要在对应云存储平台单独开启版本控制或备份。' };
    const target = path.join(folder, 'uploads');
    const count = (await walkFiles(uploadRoot)).length;
    if (count > 0) await fs.cp(uploadRoot, target, { recursive: true, errorOnExist: false, force: true });
    else await fs.mkdir(target, { recursive: true });
    return { included: true, provider, files: count };
  }

  async function audit(actor, action, target, details = {}, result = 'success') {
    try {
      await strapi.db.query('api::operation-log.operation-log').create({
        data: {
          actor: actor?.id || null,
          actor_name: actor?.name || '系统定时任务',
          actor_email: actor?.email || null,
          actor_role: actor?.backend_role?.display_name || (actor ? '后台管理员' : 'system'),
          action,
          module: 'backup',
          target_type: 'backup',
          target_id: target || null,
          target_label: target || '备份管理',
          method: 'INTERNAL',
          path: '/api/backup-management',
          result,
          details,
        },
      });
    } catch (error) {
      strapi.log.warn(`写入备份操作日志失败：${error.message}`);
    }
  }

  async function getRecord(id) {
    const validId = safeId(id);
    if (!validId) return null;
    try { return JSON.parse(await fs.readFile(path.join(dataRoot, validId, 'metadata.json'), 'utf8')); }
    catch { return null; }
  }

  async function list() {
    await ensureRoot();
    const jobRunning = Boolean(activeRun) || await lockIsActive();
    const entries = await fs.readdir(dataRoot, { withFileTypes: true });
    const rows = [];
    for (const entry of entries) {
      if (!entry.isDirectory() || !safeId(entry.name)) continue;
      const record = await getRecord(entry.name);
      if (!record) continue;
      if (record.status === 'running' && !jobRunning) {
        record.status = 'failed';
        record.completedAt = new Date().toISOString();
        record.error = '备份任务异常中断，未生成可用归档。';
        await fs.writeFile(path.join(dataRoot, entry.name, 'metadata.json'), JSON.stringify(record, null, 2), { mode: 0o600 }).catch(() => {});
      }
      rows.push(record);
    }
    return rows.sort((a, b) => String(b.startedAt).localeCompare(String(a.startedAt)));
  }

  async function sha256(file) {
    const hash = crypto.createHash('sha256');
    await new Promise((resolve, reject) => {
      const input = require('fs').createReadStream(file);
      input.on('data', (chunk) => hash.update(chunk));
      input.on('error', reject);
      input.on('end', resolve);
    });
    return hash.digest('hex');
  }

  async function runBackup(mode = 'manual', actor = null, settings = null) {
    await ensureRoot();
    let lock;
    try {
      if (await lockIsActive()) throw new Error('已有备份任务正在运行，请稍后刷新查看结果。');
      lock = await fs.open(lockDir, 'wx');
      await lock.writeFile(String(process.pid));
    } catch {
      throw new Error('已有备份任务正在运行，请稍后刷新查看结果。');
    }

    const startedAt = new Date().toISOString();
    const id = `backup-${startedAt.replace(/[:.]/g, '-')}-${crypto.randomBytes(3).toString('hex')}`;
    const folder = path.join(dataRoot, id);
    const archiveFile = path.join(dataRoot, `${id}.tar.gz`);
    const record = {
      id,
      mode,
      status: 'running',
      databaseClient: dbClient(),
      databaseName: databaseName(),
      startedAt,
      completedAt: null,
      sizeBytes: 0,
      sha256: null,
      mediaIncluded: false,
      mediaProvider: 'local',
      mediaFiles: 0,
      archiveFile: `${id}.tar.gz`,
      error: null,
      restoreSupported: ['postgres', 'postgresql', 'mysql', 'mysql2'].includes(dbClient()),
      createdBy: actor ? { name: actor.name, email: actor.email } : { name: '系统定时任务' },
    };

    try {
      await fs.mkdir(folder, { recursive: true, mode: 0o700 });
      await fs.writeFile(path.join(folder, 'metadata.json'), JSON.stringify(record, null, 2), { mode: 0o600 });
      const database = await dumpDatabase(folder);
      record.restoreSupported = database.restoreSupported;
      const media = await copyUploads(folder, settings ? settings.includeMedia : true);
      record.mediaIncluded = media.included;
      record.mediaProvider = media.provider;
      record.mediaFiles = media.files;
      record.mediaNote = media.note || null;
      await fs.writeFile(path.join(folder, 'metadata.json'), JSON.stringify(record, null, 2), { mode: 0o600 });
      await tar.c({ gzip: true, file: archiveFile, cwd: folder, portable: true }, ['.']);
      record.sizeBytes = (await fs.stat(archiveFile)).size;
      record.sha256 = await sha256(archiveFile);
      record.status = 'success';
      record.completedAt = new Date().toISOString();
      await fs.writeFile(path.join(folder, 'metadata.json'), JSON.stringify(record, null, 2), { mode: 0o600 });
      await audit(actor, mode === 'scheduled' ? 'scheduled_backup' : 'create_backup', id, { sizeBytes: record.sizeBytes, mediaIncluded: record.mediaIncluded });
      await applyRetention(settings || await readSettings());
      return record;
    } catch (error) {
      record.status = 'failed';
      record.completedAt = new Date().toISOString();
      record.error = error.message;
      await fs.mkdir(folder, { recursive: true }).catch(() => {});
      await fs.writeFile(path.join(folder, 'metadata.json'), JSON.stringify(record, null, 2), { mode: 0o600 }).catch(() => {});
      await fs.rm(archiveFile, { force: true }).catch(() => {});
      await audit(actor, mode === 'scheduled' ? 'scheduled_backup' : 'create_backup', id, { error: error.message }, 'failed');
      throw error;
    } finally {
      await lock?.close().catch(() => {});
      await fs.rm(lockDir, { recursive: true, force: true }).catch(() => {});
    }
  }

  async function applyRetention(settings) {
    const keep = Math.max(1, Math.min(100, Number(settings?.retentionCount) || 14));
    const records = await list();
    const successful = records.filter((record) => record.status === 'success');
    const remove = successful.slice(keep);
    const oldFailed = records.filter((record) => record.status === 'failed' && Date.now() - new Date(record.startedAt).getTime() > 30 * 86400000);
    for (const record of [...remove, ...oldFailed]) await deleteRecord(record.id);
  }

  async function deleteRecord(id) {
    const validId = safeId(id);
    if (!validId) throw new Error('备份编号无效。');
    const record = await getRecord(validId);
    if (!record) throw new Error('备份记录不存在。');
    await fs.rm(path.join(dataRoot, validId), { recursive: true, force: true });
    await fs.rm(path.join(dataRoot, `${validId}.tar.gz`), { force: true });
    return record;
  }

  async function archiveFor(id) {
    const record = await getRecord(id);
    if (!record || record.status !== 'success') return null;
    const file = path.join(dataRoot, record.archiveFile);
    if (!(await fs.stat(file).catch(() => null))) return null;
    return { file, record };
  }

  function localSlot(now, settings) {
    const [hour, minute] = String(settings.time || '02:00').split(':').map(Number);
    if (now.getHours() !== hour || now.getMinutes() !== minute) return null;
    if (settings.frequency === 'weekly' && now.getDay() !== Number(settings.weekday)) return null;
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return settings.frequency === 'weekly' ? `${date}-weekly` : `${date}-daily`;
  }

  return {
    async overview() {
      const settings = await readSettings();
      const records = await list();
      const latest = records.find((item) => item.status === 'success');
      return {
        data: {
          settings,
          records,
          database: { client: dbClient(), name: databaseName(), restoreSupported: ['postgres', 'postgresql', 'mysql', 'mysql2'].includes(dbClient()) },
          storage: dataRoot,
          serverTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          nextRunHint: settings.enabled ? `${settings.frequency === 'weekly' ? '每周' : '每天'} ${settings.time}（服务器本地时间）` : null,
          lastSuccessAt: latest?.completedAt || null,
          running: Boolean(activeRun) || await lockIsActive(),
        },
      };
    },

    async saveSettings(input) {
      const current = await readSettings();
      const frequency = input.frequency === 'weekly' ? 'weekly' : 'daily';
      const time = /^([01]\d|2[0-3]):[0-5]\d$/.test(String(input.time)) ? String(input.time) : current.time;
      const weekday = Math.max(0, Math.min(6, Number(input.weekday) || 0));
      const retentionCount = Math.max(1, Math.min(100, Number(input.retentionCount) || 14));
      const settings = {
        ...current,
        enabled: Boolean(input.enabled),
        frequency,
        time,
        weekday,
        retentionCount,
        includeMedia: input.includeMedia !== false,
      };
      await writeSettings(settings);
      await audit(input.actor, 'update_backup_settings', null, { enabled: settings.enabled, frequency, time, retentionCount, includeMedia: settings.includeMedia });
      return settings;
    },

    async startManual(actor) {
      if (activeRun || await lockIsActive()) {
        throw new Error('已有备份任务正在运行，请稍后刷新查看结果。');
      }
      activeRun = (async () => runBackup('manual', actor, await readSettings()))()
        .catch((error) => { strapi.log.error(`手动备份失败：${error.message}`); })
        .finally(() => { activeRun = null; });
      return { accepted: true };
    },

    async runManual(actor) { return runBackup('manual', actor, await readSettings()); },

    async runScheduled() {
      const settings = await readSettings();
      if (!settings.enabled) return;
      const now = new Date();
      const slot = localSlot(now, settings);
      if (!slot || settings.lastScheduledKey === slot) return;
      settings.lastScheduledKey = slot;
      await writeSettings(settings);
      await runBackup('scheduled', null, settings);
    },

    async listRecords() { return list(); },

    async getArchive(id) {
      return archiveFor(id);
    },

    async remove(id, actor) {
      const record = await deleteRecord(id);
      await audit(actor, 'delete_backup', id, { mode: record.mode, completedAt: record.completedAt });
      return record;
    },

    async restore(id, actor, confirmation) {
      const record = await getRecord(id);
      if (!record || record.status !== 'success') throw new Error('找不到可恢复的成功备份。');
      if (confirmation !== `RESTORE ${record.id}`) throw new Error(`请输入 RESTORE ${record.id} 确认恢复。`);
      if (!['postgres', 'postgresql', 'mysql', 'mysql2'].includes(dbClient())) throw new Error('当前 SQLite 数据库不支持在线覆盖恢复。请停止 Strapi 服务后，将备份包中的 database.sqlite 复制为当前数据库文件，并备份/替换 public/uploads。');
      const archive = await archiveFor(id);
      if (!archive) throw new Error('备份归档文件不存在。');
      if (await sha256(archive.file) !== record.sha256) throw new Error('备份归档校验失败，文件可能已损坏或被修改，已取消恢复。');

      // Create an automatic rollback point before any operation that can replace live data.
      const safety = await runBackup('pre_restore', actor, await readSettings());
      const temp = path.join(dataRoot, `.restore-${crypto.randomBytes(5).toString('hex')}`);
      await fs.mkdir(temp, { recursive: true, mode: 0o700 });
      try {
        await tar.x({ file: archive.file, cwd: temp, strict: true, preservePaths: false });
        if (dbClient() === 'postgres' || dbClient() === 'postgresql') {
          const config = dbConfig().connection || {};
          const args = ['--clean', '--if-exists', '--no-owner', '--no-privileges'];
          const options = { env: { ...process.env } };
          const urlString = config.connectionString || process.env.DATABASE_URL;
          if (urlString) {
            const url = new URL(urlString);
            args.push('--host', url.hostname, '--port', url.port || '5432', '--username', decodeURIComponent(url.username), '--dbname', decodeURIComponent(url.pathname.replace(/^\//, '')));
            if (url.password) options.env.PGPASSWORD = decodeURIComponent(url.password);
            if (url.searchParams.get('sslmode')) options.env.PGSSLMODE = url.searchParams.get('sslmode');
          } else {
            args.push('--host', String(config.host || 'localhost'), '--port', String(config.port || 5432), '--username', String(config.user || 'postgres'), '--dbname', String(config.database || 'postgres'));
            if (config.password) options.env.PGPASSWORD = String(config.password);
          }
          args.push(path.join(temp, 'database.dump'));
          await runCommand(process.env.PG_RESTORE_PATH || 'pg_restore', args, options);
        } else {
          const config = dbConfig().connection || {};
          const args = ['--host', String(config.host || 'localhost'), '--port', String(config.port || 3306), '--user', String(config.user || 'root'), String(config.database || 'strapi')];
          const options = { env: { ...process.env } };
          if (config.password) options.env.MYSQL_PWD = String(config.password);
          await importSql(process.env.MYSQL_PATH || 'mysql', args, path.join(temp, 'database.sql'), options);
        }

        // Replace local upload files only after the database import succeeds.
        if (record.mediaIncluded && record.mediaProvider === 'local') {
          const source = path.join(temp, 'uploads');
          const destination = path.join(appRoot, 'public', 'uploads');
          if (await fs.stat(source).catch(() => null)) {
            const staging = path.join(appRoot, 'public', `.uploads-restore-${crypto.randomBytes(4).toString('hex')}`);
            const previous = `${destination}.pre-restore`;
            await fs.cp(source, staging, { recursive: true, force: true });
            await fs.rm(previous, { recursive: true, force: true });
            if (await fs.stat(destination).catch(() => null)) await fs.rename(destination, previous);
            try {
              await fs.rename(staging, destination);
              await fs.rm(previous, { recursive: true, force: true });
            } catch (error) {
              if (await fs.stat(previous).catch(() => null)) await fs.rename(previous, destination).catch(() => {});
              throw error;
            }
          }
        }
        await audit(actor, 'restore_backup', id, { safetyBackupId: safety.id, databaseClient: record.databaseClient });
        return { restored: true, safetyBackupId: safety.id };
      } catch (error) {
        await audit(actor, 'restore_backup', id, { error: error.message }, 'failed');
        throw error;
      } finally {
        await fs.rm(temp, { recursive: true, force: true }).catch(() => {});
      }
    },
  };
});
