const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT) || 5432,
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || '',
  database: process.env.PG_DATABASE || 'ciphersqlstudio',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL error:', err);
});

const connectPostgres = async () => {
  try {
    const client = await pool.connect();
    console.log('PostgreSQL connected successfully');
    client.release();
  } catch (error) {
    console.error('PostgreSQL connection error:', error.message);
    process.exit(1);
  }
};

module.exports = { pool, connectPostgres };
