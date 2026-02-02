const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("✅ PostgreSQL Connected Successfully!");

    // Check tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log(
      "📊 Available Tables:",
      result.rows.map((r) => r.table_name).join(", "),
    );

    client.release();
    return true;
  } catch (error) {
    console.error("❌ Database Connection Error:", error.message);
    console.log("\n🔧 Please check:");
    console.log(
      "   1. Is PostgreSQL running? (brew services list | grep postgresql)",
    );
    console.log("   2. Correct password in .env file?");
    console.log('   3. Database "parking_system" exists?');
    return false;
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  testConnection,
};
