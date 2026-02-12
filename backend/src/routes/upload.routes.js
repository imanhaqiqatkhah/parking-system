const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const UploadController = require("../controllers/upload.controller");

// آپلود عکس ورود
router.post("/entry", upload.single("image"), UploadController.uploadEntry);

// آپلود عکس خروج
router.post("/exit", upload.single("image"), UploadController.uploadExit);

module.exports = router;
