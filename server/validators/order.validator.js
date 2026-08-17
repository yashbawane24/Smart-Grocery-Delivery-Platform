const { body } = require("express-validator");

const checkoutValidator = [
  body("addressId").notEmpty().withMessage("Delivery address is required"),
  body("items").isArray({ min: 1 }).withMessage("Cart cannot be empty"),
  body("items.*.productId").notEmpty().withMessage("Each item needs a productId"),
  body("items.*.quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
  body("paymentMethod")
    .isIn(["card", "cod", "wallet"])
    .withMessage("Invalid payment method"),
];

module.exports = { checkoutValidator };
