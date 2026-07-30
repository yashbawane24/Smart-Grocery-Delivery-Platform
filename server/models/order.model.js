const { pool, query } = require("../config/db");

const OrderModel = {
  // Creates the order + order_items in a single DB transaction so we never
  // end up with a charged order that has no line items (or vice versa).
  async createOrder({ userId, addressId, items, couponId, deliverySlot, subtotal, discount, deliveryFee, total, paymentMethod }) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const { rows: orderRows } = await client.query(
        `INSERT INTO orders
           (user_id, address_id, coupon_id, delivery_slot, subtotal, discount,
            delivery_fee, total, payment_method, status, payment_status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'placed','pending')
         RETURNING *`,
        [userId, addressId, couponId, deliverySlot, subtotal, discount, deliveryFee, total, paymentMethod]
      );
      const order = orderRows[0];

      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
           VALUES ($1,$2,$3,$4)`,
          [order.id, item.productId, item.quantity, item.unitPrice]
        );
        await client.query(
          "UPDATE products SET stock = stock - $2, sold_count = sold_count + $2 WHERE id = $1",
          [item.productId, item.quantity]
        );
      }

      await client.query(
        `INSERT INTO activity_logs (user_id, action, meta)
         VALUES ($1, 'order_placed', $2)`,
        [userId, JSON.stringify({ orderId: order.id, total })]
      );

      await client.query("COMMIT");
      return order;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  async findById(id) {
    const { rows } = await query("SELECT * FROM orders WHERE id = $1", [id]);
    if (!rows[0]) return null;

    const { rows: items } = await query(
      `SELECT oi.*, p.name, p.images
       FROM order_items oi JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = $1`,
      [id]
    );
    return { ...rows[0], items };
  },

  async findByUser(userId, { limit, offset }) {
    const { rows } = await query(
      `SELECT * FROM orders WHERE user_id = $1
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return rows;
  },

  async findAllAdmin({ status, limit, offset }) {
    const clauses = [];
    const params = [];
    if (status) {
      params.push(status);
      clauses.push(`status = $${params.length}`);
    }
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    params.push(limit, offset);

    const { rows } = await query(
      `SELECT o.*, u.name AS customer_name, u.email AS customer_email
       FROM orders o JOIN users u ON u.id = o.user_id
       ${where}
       ORDER BY o.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    return rows;
  },

  async updateStatus(id, status) {
    const { rows } = await query(
      "UPDATE orders SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *",
      [id, status]
    );
    return rows[0];
  },

  async assignDeliveryPartner(id, partnerId) {
    const { rows } = await query(
      `UPDATE orders SET delivery_partner_id = $2, status = 'assigned', updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id, partnerId]
    );
    return rows[0];
  },

  async revenueStats() {
    const { rows } = await query(
      `SELECT
         COALESCE(SUM(total), 0)::float AS total_revenue,
         COUNT(*)::int AS total_orders,
         COALESCE(AVG(total), 0)::float AS avg_order_value
       FROM orders WHERE payment_status = 'paid'`
    );
    return rows[0];
  },

  async salesByDay(days = 14) {
    const { rows } = await query(
      `SELECT DATE(created_at) AS date, COALESCE(SUM(total),0)::float AS revenue, COUNT(*)::int AS orders
       FROM orders
       WHERE created_at >= NOW() - ($1 || ' days')::interval
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [days]
    );
    return rows;
  },
};

module.exports = OrderModel;
