// ============================================================
// config/db.js — Conexión a MySQL con mysql2
// ============================================================

const mysql = require('mysql2/promise');
require('dotenv').config();

// Crear pool de conexiones (más eficiente que una sola conexión)
const pool = mysql.createPool({
  host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
  port: Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306),
  user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
  database: process.env.DB_NAME || process.env.MYSQLDATABASE || 'skyline_airlines',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Función para inicializar la base de datos (crear tablas si no existen)
async function initDB() {
  const conn = await pool.getConnection();
  try {
	// Tabla de usuarios
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅  Base de datos lista');
  } finally {
    conn.release();
  }
}

initDB().catch(err => {
  console.error('❌  Error al inicializar la BD:', err.message);
  console.error('   Verifica las credenciales en tu archivo .env');
});

module.exports = pool;
