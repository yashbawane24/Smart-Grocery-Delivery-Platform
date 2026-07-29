const { query } = require("../config/db");

const CategoryModel = {
  async findAll() {
    const { rows } = await query(
      `SELECT c.*, COUNT(p.id)::int AS product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id AND p.is_active = true
       GROUP BY c.id
       ORDER BY c.name ASC`
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await query("SELECT * FROM categories WHERE id = $1", [id]);
    return rows[0];
  },

  async create({ name, slug, image }) {
    const { rows } = await query(
      "INSERT INTO categories (name, slug, image) VALUES ($1,$2,$3) RETURNING *",
      [name, slug, image]
    );
    return rows[0];
  },

  async update(id, { name, slug, image }) {
    const { rows } = await query(
      `UPDATE categories SET
         name = COALESCE($2, name),
         slug = COALESCE($3, slug),
         image = COALESCE($4, image)
       WHERE id = $1 RETURNING *`,
      [id, name, slug, image]
    );
    return rows[0];
  },

  async delete(id) {
    await query("DELETE FROM categories WHERE id = $1", [id]);
  },
};

module.exports = CategoryModel;
