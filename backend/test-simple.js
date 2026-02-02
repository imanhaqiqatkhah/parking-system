const { Client } = require("pg");

const configs = [
  {
    name: "User postgres with password admin123",
    config: {
      host: "localhost",
      port: 5432,
      database: "parking_system",
      user: "postgres",
      password: "admin123",
    },
  },
  {
    name: "User postgres with empty password",
    config: {
      host: "localhost",
      port: 5432,
      database: "parking_system",
      user: "postgres",
      password: "",
    },
  },
];

async function testConnection(config) {
  const client = new Client(config);
  try {
    await client.connect();
    console.log(`✅ ${config.name}: Connected successfully!`);
    await client.end();
    return true;
  } catch (error) {
    console.log(`❌ ${config.name}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log("🔍 Testing PostgreSQL connections...\n");

  for (const config of configs) {
    await testConnection(config);
  }

  console.log("\n💡 If none worked, try:");
  console.log("   1. Create new user:");
  console.log("      CREATE USER parking_admin WITH PASSWORD 'admin123';");
  console.log("   2. Or use Docker:");
  console.log("      docker-compose up -d");
}

main();
