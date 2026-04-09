const { Pool } = require('pg');

// 从 .env.local 读取数据库连接
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ 数据库连接成功:', result.rows[0]);
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    console.error('详细错误:', error);
  } finally {
    await pool.end();
  }
}

testConnection();
