const app = require("./app");
require("dotenv").config();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`
🚀 Parking Management System API
📍 Port: ${PORT}
📅 Time: ${new Date().toLocaleString("fa-IR")}
🌐 Environment: ${process.env.NODE_ENV}
📊 Health Check: http://localhost:${PORT}/health
📚 API Documentation:
   • POST   /api/vehicles/entry    - ثبت ورود ماشین
   • POST   /api/vehicles/exit     - ثبت خروج ماشین
   • GET    /api/vehicles/parked   - لیست ماشین‌های پارک شده
   • GET    /api/vehicles/history  - تاریخچه پارکینگ
   • GET    /api/vehicles/stats    - آمار پارکینگ
   • GET    /api/vehicles/search   - جستجوی ماشین
`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received: shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received: shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
