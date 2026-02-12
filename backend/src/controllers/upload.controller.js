const PlateRecognitionService = require("../services/plateRecognition");
const Vehicle = require("../models/Vehicle");
const ParkingLog = require("../models/ParkingLog");

class UploadController {
  // آپلود عکس ورود
  static async uploadEntry(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "لطفاً یک عکس انتخاب کنید",
        });
      }

      // تشخیص پلاک از عکس
      const recognition = await PlateRecognitionService.recognizePlate(
        req.file.path,
      );

      if (!recognition.success) {
        return res.status(400).json({
          success: false,
          error: "تشخیص پلاک انجام نشد",
          recognition: recognition,
        });
      }

      // پیدا کردن یا ایجاد ماشین
      let vehicle = await Vehicle.findByPlate(recognition.plate_number);

      if (!vehicle) {
        vehicle = await Vehicle.create(recognition.plate_number, "car", "", "");
      }

      // ثبت ورود با عکس
      const imageUrl = `/uploads/${req.file.filename}`;
      const parkingLog = await ParkingLog.entry(vehicle.id, imageUrl);

      res.status(201).json({
        success: true,
        message: "ورود ماشین با موفقیت ثبت شد",
        data: {
          vehicle,
          parkingLog,
          recognition: {
            plate_number: recognition.plate_number,
            confidence: recognition.confidence,
            image_url: imageUrl,
          },
        },
      });
    } catch (error) {
      console.error("Upload entry error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // آپلود عکس خروج
  static async uploadExit(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "لطفاً یک عکس انتخاب کنید",
        });
      }

      // تشخیص پلاک از عکس
      const recognition = await PlateRecognitionService.recognizePlate(
        req.file.path,
      );

      if (!recognition.success) {
        return res.status(400).json({
          success: false,
          error: "تشخیص پلاک انجام نشد",
        });
      }

      // پیدا کردن ماشین
      const vehicle = await Vehicle.findByPlate(recognition.plate_number);

      if (!vehicle) {
        return res.status(404).json({
          success: false,
          error: "ماشین با این پلاک یافت نشد",
        });
      }

      // ثبت خروج با عکس
      const imageUrl = `/uploads/${req.file.filename}`;
      const parkingLog = await ParkingLog.exit(vehicle.id, imageUrl);

      res.json({
        success: true,
        message: "خروج ماشین با موفقیت ثبت شد",
        data: {
          vehicle,
          parkingLog,
          recognition: {
            plate_number: recognition.plate_number,
            confidence: recognition.confidence,
            image_url: imageUrl,
          },
        },
      });
    } catch (error) {
      console.error("Upload exit error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = UploadController;
