const express = require("express");
const {
  checkout, getMyOrders, getOrder, getAllOrders, updateOrderStatus, assignDeliveryPartner,
} = require("../controllers/order.controller");
const { protect, authorize } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { checkoutValidator } = require("../validators/order.validator");

const router = express.Router();

router.use(protect);

router.post("/checkout", checkoutValidator, validate, checkout);
router.get("/my-orders", getMyOrders);
router.get("/:id", getOrder);

router.get("/", authorize("admin"), getAllOrders);
router.patch("/:id/status", authorize("admin", "delivery_partner"), updateOrderStatus);
router.patch("/:id/assign", authorize("admin"), assignDeliveryPartner);

module.exports = router;
