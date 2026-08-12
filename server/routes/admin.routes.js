const express = require("express");
const { getDashboardStats } = require("../controllers/dashboard.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/dashboard", protect, authorize("admin"), getDashboardStats);

module.exports = router;
