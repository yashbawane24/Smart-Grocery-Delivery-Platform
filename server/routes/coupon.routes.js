const express = require("express");
const { getCoupons, createCoupon, validateCoupon } = require("../controllers/coupon.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/validate", protect, validateCoupon);
router.get("/", protect, authorize("admin"), getCoupons);
router.post("/", protect, authorize("admin"), createCoupon);

module.exports = router;
