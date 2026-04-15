// ============================================================
// config/db.js — Conexión a MySQL con mysql2
// ============================================================

const mysql = require('mysql2/promise');
require('dotenv').config();

// Crear pool de conexiones (más eficiente que una sola conexión)
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'skyline_airlines',
  waitForConnections: true,
  connectionLimit: 10,   // máximo 10 conexiones simultáneas
  queueLimit: 0
});

// Función para inicializar la base de datos (crear tablas si no existen)
async function initDB() {
  const conn = await pool.getConnection();
  try {
    // Crear base de datos si no existe
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'skyline_airlines'}\``);
    await conn.query(`USE \`${process.env.DB_NAME || 'skyline_airlines'}\``);

    // Tabla de usuarios
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        name       VARCHAR(100) NOT NULL,
        email      VARCHAR(150) NOT NULL UNIQUE,
        password   VARCHAR(255) NOT NULL,
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
