const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const OrderModel = require("../models/order.model");
const ProductModel = require("../models/product.model");
const CouponModel = require("../models/coupon.model");
const paginate = require("../utils/paginate");
const { createPaymentIntent } = require("../services/payment.service");
const { inngest } = require("../jobs/inngest.client");

const DELIVERY_FEE = 25;

// @route POST /api/v1/orders/checkout
const checkout = asyncHandler(async (req, res) => {
  const { addressId, items, couponCode, deliverySlot, paymentMethod } = req.body;

  if (!items?.length) throw new ApiError(400, "Your cart is empty");

  let subtotal = 0;
  const resolvedItems = [];

  for (const cartItem of items) {
    const product = await ProductModel.findById(cartItem.productId);
    if (!product) throw new ApiError(404, `Product ${cartItem.productId} not found`);
    if (product.stock < cartItem.quantity) {
      throw new ApiError(409, `${product.name} has only ${product.stock} left in stock`);
    }
    subtotal += Number(product.price) * cartItem.quantity;
    resolvedItems.push({
      productId: product.id,
      quantity: cartItem.quantity,
      unitPrice: product.price,
    });
  }

  let discount = 0;
  let coupon = null;
  if (couponCode) {
    coupon = await CouponModel.findByCode(couponCode);
    if (!coupon) throw new ApiError(400, "Coupon is invalid or expired");
    discount = CouponModel.calculateDiscount(coupon, subtotal);
  }

  const total = Math.max(subtotal - discount + DELIVERY_FEE, 0);

  const order = await OrderModel.createOrder({
    userId: req.user.id,
    addressId,
    items: resolvedItems,
    couponId: coupon?.id || null,
    deliverySlot,
    subtotal,
    discount,
    deliveryFee: DELIVERY_FEE,
    total,
    paymentMethod,
  });

  if (coupon) await CouponModel.incrementUsage(coupon.id);

  let clientSecret = null;
  if (paymentMethod === "card") {
    const intent = await createPaymentIntent({
      amount: total,
      metadata: { orderId: order.id, userId: req.user.id },
    });
    clientSecret = intent.client_secret;
  }

  await inngest.send({
    name: "order/placed",
    data: { orderId: order.id, userId: req.user.id, total },
  });

  res.status(201).json({ success: true, data: { order, clientSecret } });
});

// @route GET /api/v1/orders/my-orders
const getMyOrders = asyncHandler(async (req, res) => {
  const { page, limit, offset } = paginate(req);
  const orders = await OrderModel.findByUser(req.user.id, { limit, offset });
  res.status(200).json({ success: true, data: orders, pagination: { page, limit } });
});

// @route GET /api/v1/orders/:id
const getOrder = asyncHandler(async (req, res) => {
  const order = await OrderModel.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  const isOwner = order.user_id === req.user.id;
  const isPrivileged = ["admin", "delivery_partner"].includes(req.user.role);
  if (!isOwner && !isPrivileged) throw new ApiError(403, "Not authorized to view this order");

  res.status(200).json({ success: true, data: order });
});

// @route GET /api/v1/orders  (admin)
const getAllOrders = asyncHandler(async (req, res) => {
  const { page, limit, offset } = paginate(req);
  const { status } = req.query;
  const orders = await OrderModel.findAllAdmin({ status, limit, offset });
  res.status(200).json({ success: true, data: orders, pagination: { page, limit } });
});

// @route PATCH /api/v1/orders/:id/status  (admin / delivery partner)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await OrderModel.updateStatus(req.params.id, status);
  if (!order) throw new ApiError(404, "Order not found");

  await inngest.send({
    name: "order/status-updated",
    data: { orderId: order.id, status, userId: order.user_id },
  });

  res.status(200).json({ success: true, data: order });
});

// @route PATCH /api/v1/orders/:id/assign  (admin)
const assignDeliveryPartner = asyncHandler(async (req, res) => {
  const { partnerId } = req.body;
  const order = await OrderModel.assignDeliveryPartner(req.params.id, partnerId);
  if (!order) throw new ApiError(404, "Order not found");
  res.status(200).json({ success: true, data: order });
});

module.exports = {
  checkout,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  assignDeliveryPartner,
};
