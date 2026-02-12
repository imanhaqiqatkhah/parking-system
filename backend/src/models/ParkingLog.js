const db = require("../config/database");

class ParkingLog {
  // Register vehicle entry
  static async entry(vehicleId, imageUrl = null) {
    const query = `
      INSERT INTO parking_logs (vehicle_id, entry_image_url, status) 
      VALUES ($1, $2, 'parked') 
      RETURNING *
    `;
    const result = await db.query(query, [vehicleId, imageUrl]);
    return result.rows[0];
  }

  // Register vehicle exit
  static async exit(vehicleId, imageUrl = null) {
    // First check if vehicle is parked
    const checkQuery = `
      SELECT * FROM parking_logs 
      WHERE vehicle_id = $1 AND status = 'parked'
      ORDER BY entry_time DESC 
      LIMIT 1
    `;
    const checkResult = await db.query(checkQuery, [vehicleId]);

    if (checkResult.rows.length === 0) {
      return null;
    }

    const logId = checkResult.rows[0].id;

    // Calculate fee (simple hourly rate)
    const feeQuery = `
      UPDATE parking_logs 
      SET 
        exit_time = CURRENT_TIMESTAMP,
        exit_image_url = $2,
        status = 'exited',
        fee = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - entry_time)) / 3600 * 10000
      WHERE id = $1
      RETURNING *
    `;

    const result = await db.query(feeQuery, [logId, imageUrl]);
    return result.rows[0];
  }

  // Get currently parked vehicles
  static async getParkedVehicles() {
    const query = `
      SELECT 
        v.id as vehicle_id,
        v.plate_number,
        v.vehicle_type,
        v.owner_name,
        v.phone_number,
        p.id as log_id,
        p.entry_time,
        p.entry_image_url,
        EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - p.entry_time)) / 60 as minutes_parked
      FROM parking_logs p
      JOIN vehicles v ON p.vehicle_id = v.id
      WHERE p.status = 'parked'
      ORDER BY p.entry_time ASC
    `;
    const result = await db.query(query);
    return result.rows;
  }

  // Get parking history
  static async getHistory(limit = 50, offset = 0) {
    const query = `
      SELECT 
        v.plate_number,
        v.vehicle_type,
        v.owner_name,
        p.entry_time,
        p.exit_time,
        p.status,
        p.fee,
        p.payment_status,
        ROUND(EXTRACT(EPOCH FROM (p.exit_time - p.entry_time)) / 3600, 2) as hours_parked
      FROM parking_logs p
      JOIN vehicles v ON p.vehicle_id = v.id
      ORDER BY p.entry_time DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await db.query(query, [limit, offset]);
    return result.rows;
  }

  // Get parking statistics
  static async getStats() {
    try {
      const query = `
      SELECT 
        COUNT(CASE WHEN status = 'parked' THEN 1 END) as parked_count,
        COUNT(CASE WHEN DATE(entry_time) = CURRENT_DATE THEN 1 END) as today_entries,
        COALESCE(SUM(CASE WHEN DATE(exit_time) = CURRENT_DATE AND status = 'exited' THEN fee ELSE 0 END), 0) as today_revenue,
        COUNT(CASE 
          WHEN EXTRACT(MONTH FROM entry_time) = EXTRACT(MONTH FROM CURRENT_DATE) 
          AND EXTRACT(YEAR FROM entry_time) = EXTRACT(YEAR FROM CURRENT_DATE) 
          THEN 1 END) as month_entries,
        COALESCE(SUM(CASE 
          WHEN EXTRACT(MONTH FROM exit_time) = EXTRACT(MONTH FROM CURRENT_DATE) 
          AND EXTRACT(YEAR FROM exit_time) = EXTRACT(YEAR FROM CURRENT_DATE) 
          AND status = 'exited' 
          THEN fee ELSE 0 END), 0) as month_revenue,
        COUNT(*) as total_entries,
        (
          SELECT JSON_AGG(json_build_object('type', vehicle_type, 'count', count))
          FROM (
            SELECT v.vehicle_type, COUNT(*) as count
            FROM parking_logs p
            JOIN vehicles v ON p.vehicle_id = v.id
            WHERE DATE(p.entry_time) = CURRENT_DATE
            GROUP BY v.vehicle_type
          ) sub
        ) as today_by_type
      FROM parking_logs
    `;

      const result = await db.query(query);
      console.log("📊 Stats from DB:", result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error("Error getting stats:", error);
      return {
        parked_count: 0,
        today_entries: 0,
        today_revenue: 0,
        month_entries: 0,
        month_revenue: 0,
        total_entries: 0,
        today_by_type: null,
      };
    }
  }

  static async getDailyRevenue(days = 7) {
    try {
      const query = `
      SELECT 
        DATE(exit_time) as date,
        COALESCE(SUM(fee), 0) as revenue,
        COUNT(*) as exits_count
      FROM parking_logs
      WHERE status = 'exited' 
        AND exit_time >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY DATE(exit_time)
      ORDER BY DATE(exit_time) DESC
    `;

      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error("Error getting daily revenue:", error);
      return [];
    }
  }
}

module.exports = ParkingLog;
