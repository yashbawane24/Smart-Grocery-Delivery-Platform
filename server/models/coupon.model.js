const { query } = require("../config/db");

const CouponModel = {
  async findByCode(code) {
    const { rows } = await query(
      `SELECT * FROM coupons
       WHERE code = $1 AND is_active = true
         AND (expires_at IS NULL OR expires_at > NOW())`,
      [code.toUpperCase()]
    );
    return rows[0];
  },

  async findAll() {
    const { rows } = await query("SELECT * FROM coupons ORDER BY created_at DESC");
    return rows;
  },

  async create(data) {
    const { code, type, value, minOrderValue, maxDiscount, expiresAt, usageLimit } = data;
    const { rows } = await query(
      `INSERT INTO coupons (code, type, value, min_order_value, max_discount, expires_at, usage_limit)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [code.toUpperCase(), type, value, minOrderValue, maxDiscount, expiresAt, usageLimit]
    );
    return rows[0];
  },

  async incrementUsage(id) {
    await query("UPDATE coupons SET used_count = used_count + 1 WHERE id = $1", [id]);
  },

  calculateDiscount(coupon, subtotal) {
    if (subtotal < (coupon.min_order_value || 0)) return 0;
    let discount =
      coupon.type === "percentage" ? (subtotal * coupon.value) / 100 : coupon.value;
    if (coupon.max_discount) discount = Math.min(discount, coupon.max_discount);
    return Math.round(discount * 100) / 100;
  },
};

module.exports = CouponModel;
