const express = require("express");
const cors = require("cors");
const path = require("path");
const { testConnection } = require("./config/database");

// Import routes
const vehicleRoutes = require("./routes/vehicle.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", async (req, res) => {
  const dbStatus = await testConnection();

  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "Parking Management System API",
    database: dbStatus ? "Connected" : "Disconnected",
    uptime: process.uptime(),
  });
});

// API Routes
app.use("/api/vehicles", vehicleRoutes);

// 404 handler - FIXED: use a function instead of '*'
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

app.use(
  cors({
    origin: "http://localhost:8080", // پورت Vue.js dev server
    credentials: true,
  }),
);

const uploadRoutes = require("./routes/upload.routes");

// سرو فایل‌های استاتیک
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// روت‌های آپلود
app.use("/api/upload", uploadRoutes);

module.exports = app;
