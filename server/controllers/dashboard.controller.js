const asyncHandler = require("../utils/asyncHandler");
const OrderModel = require("../models/order.model");
const { query } = require("../config/db");

// @route GET /api/v1/admin/dashboard
const getDashboardStats = asyncHandler(async (req, res) => {
  const revenue = await OrderModel.revenueStats();
  const salesTrend = await OrderModel.salesByDay(14);

  const { rows: customerCount } = await query(
    "SELECT COUNT(*)::int AS total FROM users WHERE role = 'customer'"
  );
  const { rows: productCount } = await query(
    "SELECT COUNT(*)::int AS total FROM products WHERE is_active = true"
  );
  const { rows: lowStock } = await query(
    "SELECT id, name, stock FROM products WHERE stock <= 10 AND is_active = true ORDER BY stock ASC LIMIT 10"
  );
  const { rows: recentOrders } = await query(
    `SELECT o.id, o.total, o.status, o.created_at, u.name AS customer_name
     FROM orders o JOIN users u ON u.id = o.user_id
     ORDER BY o.created_at DESC LIMIT 8`
  );

  res.status(200).json({
    success: true,
    data: {
      revenue,
      salesTrend,
      customers: customerCount[0].total,
      products: productCount[0].total,
      lowStock,
      recentOrders,
    },
  });
});

module.exports = { getDashboardStats };
