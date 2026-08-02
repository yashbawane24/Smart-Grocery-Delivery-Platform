const express = require("express");
const { serve } = require("inngest/express");
const { inngest, functions } = require("../jobs/inngest.client");

const authRoutes = require("./auth.routes");
const productRoutes = require("./product.routes");
const categoryRoutes = require("./category.routes");
const orderRoutes = require("./order.routes");
const addressRoutes = require("./address.routes");
const couponRoutes = require("./coupon.routes");
const adminRoutes = require("./admin.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/orders", orderRoutes);
router.use("/addresses", addressRoutes);
router.use("/coupons", couponRoutes);
router.use("/admin", adminRoutes);

// Inngest background job endpoint (also handled separately in server.js for
// signature verification on raw body if needed).
router.use("/inngest", serve({ client: inngest, functions }));

module.exports = router;
