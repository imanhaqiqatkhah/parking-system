const express = require("express");
const router = express.Router();
const Vehicle = require("../models/Vehicle");
const ParkingLog = require("../models/ParkingLog");

// Vehicle Entry
router.post("/entry", async (req, res) => {
  try {
    const { plate_number, vehicle_type, owner_name, phone_number } = req.body;

    // Validation
    if (!plate_number || plate_number.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "شماره پلاک الزامی است",
      });
    }

    // Find or create vehicle
    let vehicle = await Vehicle.findByPlate(plate_number);

    if (!vehicle) {
      const createResult = await Vehicle.create(
        plate_number,
        vehicle_type || "car",
        owner_name,
        phone_number,
      );

      if (!createResult.success) {
        return res.status(400).json({
          success: false,
          error: createResult.error,
        });
      }

      vehicle = createResult.data;
    }

    // Register entry
    const parkingLog = await ParkingLog.entry(vehicle.id);

    res.status(201).json({
      success: true,
      message: "ورود ماشین با موفقیت ثبت شد",
      data: {
        vehicle,
        parkingLog,
        entryTime: parkingLog.entry_time,
      },
    });
  } catch (error) {
    console.error("Entry Error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در ثبت ورود",
    });
  }
});

// Vehicle Exit
router.post("/exit", async (req, res) => {
  try {
    const { plate_number } = req.body;

    if (!plate_number) {
      return res.status(400).json({
        success: false,
        error: "شماره پلاک الزامی است",
      });
    }

    // Find vehicle
    const vehicle = await Vehicle.findByPlate(plate_number);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: "ماشین با این پلاک یافت نشد",
      });
    }

    // Register exit
    const parkingLog = await ParkingLog.exit(vehicle.id);

    if (!parkingLog) {
      return res.status(400).json({
        success: false,
        error: "ماشین قبلاً خارج شده است یا لاگ ورود یافت نشد",
      });
    }

    res.json({
      success: true,
      message: "خروج ماشین با موفقیت ثبت شد",
      data: {
        vehicle,
        parkingLog,
        exitTime: parkingLog.exit_time,
        fee: parkingLog.fee,
        hoursParked: (parkingLog.fee / 10000).toFixed(2),
      },
    });
  } catch (error) {
    console.error("Exit Error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در ثبت خروج",
    });
  }
});

// Get currently parked vehicles
router.get("/parked", async (req, res) => {
  try {
    const vehicles = await ParkingLog.getParkedVehicles();

    res.json({
      success: true,
      count: vehicles.length,
      data: vehicles.map((v) => ({
        ...v,
        minutes_parked: Math.round(v.minutes_parked),
      })),
    });
  } catch (error) {
    console.error("Get Parked Error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در دریافت اطلاعات",
    });
  }
});

// Get parking history
router.get("/history", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const history = await ParkingLog.getHistory(limit, offset);

    res.json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    console.error("History Error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در دریافت تاریخچه",
    });
  }
});

// Get parking statistics
router.get("/stats", async (req, res) => {
  try {
    const stats = await ParkingLog.getStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در دریافت آمار",
    });
  }
});

// Search vehicles
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "عبارت جستجو الزامی است",
      });
    }

    const results = await Vehicle.search(q.trim());

    res.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در جستجو",
    });
  }
});

router.get("/daily-revenue", async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const revenue = await ParkingLog.getDailyRevenue(days);

    res.json({
      success: true,
      data: revenue,
    });
  } catch (error) {
    console.error("Error getting daily revenue:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
