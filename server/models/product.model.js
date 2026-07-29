const { query } = require("../config/db");

const ALLOWED_SORT = {
  price_asc: "price ASC",
  price_desc: "price DESC",
  rating: "rating DESC",
  newest: "created_at DESC",
  popular: "sold_count DESC",
};

const ProductModel = {
  async findAll({ category, search, minPrice, maxPrice, sort, limit, offset }) {
    const clauses = ["is_active = true"];
    const params = [];

    if (category) {
      params.push(category);
      clauses.push(`category_id = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      clauses.push(`name ILIKE $${params.length}`);
    }
    if (minPrice) {
      params.push(minPrice);
      clauses.push(`price >= $${params.length}`);
    }
    if (maxPrice) {
      params.push(maxPrice);
      clauses.push(`price <= $${params.length}`);
    }

    const orderBy = ALLOWED_SORT[sort] || "created_at DESC";
    params.push(limit, offset);

    const { rows } = await query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE ${clauses.join(" AND ")}
       ORDER BY ${orderBy}
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const { rows: countRows } = await query(
      `SELECT COUNT(*)::int AS total FROM products p WHERE ${clauses.join(" AND ")}`,
      params.slice(0, params.length - 2)
    );

    return { items: rows, total: countRows[0].total };
  },

  async findById(id) {
    const { rows } = await query(
      `SELECT p.*, c.name AS category_name
       FROM products p LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.id = $1`,
      [id]
    );
    return rows[0];
  },

  async create(data) {
    const {
      name, description, price, oldPrice, unit, stock,
      categoryId, images, sku,
    } = data;
    const { rows } = await query(
      `INSERT INTO products
         (name, description, price, old_price, unit, stock, category_id, images, sku)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [name, description, price, oldPrice, unit, stock, categoryId, images, sku]
    );
    return rows[0];
  },

  async update(id, data) {
    const fields = [];
    const params = [id];
    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined) return;
      params.push(value);
      fields.push(`${key} = $${params.length}`);
    });
    if (!fields.length) return this.findById(id);

    const { rows } = await query(
      `UPDATE products SET ${fields.join(", ")}, updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      params
    );
    return rows[0];
  },

  async delete(id) {
    await query("UPDATE products SET is_active = false WHERE id = $1", [id]);
  },

  async decrementStock(id, qty) {
    await query(
      "UPDATE products SET stock = stock - $2, sold_count = sold_count + $2 WHERE id = $1",
      [id, qty]
    );
  },
};

module.exports = ProductModel;
