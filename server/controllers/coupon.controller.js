const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const CouponModel = require("../models/coupon.model");

const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await CouponModel.findAll();
  res.status(200).json({ success: true, data: coupons });
});

const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await CouponModel.create(req.body);
  res.status(201).json({ success: true, data: coupon });
});

const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body;
  const coupon = await CouponModel.findByCode(code);
  if (!coupon) throw new ApiError(400, "Coupon is invalid or expired");

  const discount = CouponModel.calculateDiscount(coupon, subtotal);
  if (discount === 0 && coupon.min_order_value > subtotal) {
    throw new ApiError(400, `Minimum order value of ₹${coupon.min_order_value} required`);
  }

  res.status(200).json({ success: true, data: { coupon, discount } });
});

module.exports = { getCoupons, createCoupon, validateCoupon };
