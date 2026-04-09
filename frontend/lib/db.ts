// lib/db.ts
import { Pool } from 'pg';

// 强制只在服务器端使用（Next.js 最佳实践）
import 'server-only';

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'zgweb_cms',
  // 生产环境建议加上 SSL（可选）
  // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export default pool;

// 可选：优雅关闭连接池（生产上线时用）
export async function closePool() {
  await pool.end();
}
