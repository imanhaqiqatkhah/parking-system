// backend/src/models/Settings.js
const db = require("../config/database");

class Settings {
  static async getRates() {
    try {
      // Try to get from database first
      const query = "SELECT * FROM settings WHERE key IN ($1, $2)";
      const result = await db.query(query, ["car_rate", "motorcycle_rate"]);

      const rates = {
        carRate: 10000,
        motorcycleRate: 5000,
      };

      result.rows.forEach((row) => {
        if (row.key === "car_rate") rates.carRate = parseInt(row.value);
        if (row.key === "motorcycle_rate")
          rates.motorcycleRate = parseInt(row.value);
      });

      return rates;
    } catch (error) {
      console.error("Error getting rates:", error);
      return { carRate: 10000, motorcycleRate: 5000 };
    }
  }

  static async saveRates(carRate, motorcycleRate) {
    try {
      const query = `
        INSERT INTO settings (key, value, updated_at) 
        VALUES ($1, $2, NOW())
        ON CONFLICT (key) DO UPDATE 
        SET value = $2, updated_at = NOW()
      `;

      await db.query(query, ["car_rate", carRate.toString()]);
      await db.query(query, ["motorcycle_rate", motorcycleRate.toString()]);

      return { success: true };
    } catch (error) {
      console.error("Error saving rates:", error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = Settings;
