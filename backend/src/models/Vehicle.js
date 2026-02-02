const db = require("../config/database");

class Vehicle {
  // Create new vehicle
  static async create(
    plateNumber,
    vehicleType = "car",
    ownerName = "",
    phone = "",
  ) {
    const query = `
      INSERT INTO vehicles (plate_number, vehicle_type, owner_name, phone_number) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
    `;
    const values = [
      plateNumber.toUpperCase().trim(),
      vehicleType,
      ownerName || null,
      phone || null,
    ];

    try {
      const result = await db.query(query, values);
      return { success: true, data: result.rows[0] };
    } catch (error) {
      if (error.code === "23505") {
        return { success: false, error: "پلاک تکراری است" };
      }
      return { success: false, error: error.message };
    }
  }

  // Find vehicle by plate number
  static async findByPlate(plateNumber) {
    const query = "SELECT * FROM vehicles WHERE plate_number = $1";
    const result = await db.query(query, [plateNumber.toUpperCase().trim()]);
    return result.rows[0];
  }

  // Get all vehicles
  static async getAll(limit = 100, offset = 0) {
    const query = `
      SELECT * FROM vehicles 
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2
    `;
    const result = await db.query(query, [limit, offset]);
    return result.rows;
  }

  // Search vehicles
  static async search(searchTerm) {
    const query = `
      SELECT * FROM vehicles 
      WHERE plate_number ILIKE $1 
         OR owner_name ILIKE $1 
         OR phone_number ILIKE $1
      ORDER BY created_at DESC 
      LIMIT 50
    `;
    const result = await db.query(query, [`%${searchTerm}%`]);
    return result.rows;
  }
}

module.exports = Vehicle;
