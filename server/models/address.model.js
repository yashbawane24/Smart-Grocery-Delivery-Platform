const { query } = require("../config/db");

const AddressModel = {
  async findByUser(userId) {
    const { rows } = await query(
      "SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC",
      [userId]
    );
    return rows;
  },

  async create(userId, data) {
    const { label, line1, line2, city, state, pincode, lat, lng, isDefault } = data;
    if (isDefault) {
      await query("UPDATE addresses SET is_default = false WHERE user_id = $1", [userId]);
    }
    const { rows } = await query(
      `INSERT INTO addresses
         (user_id, label, line1, line2, city, state, pincode, lat, lng, is_default)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [userId, label, line1, line2, city, state, pincode, lat, lng, !!isDefault]
    );
    return rows[0];
  },

  async delete(userId, id) {
    await query("DELETE FROM addresses WHERE id = $1 AND user_id = $2", [id, userId]);
  },
};

module.exports = AddressModel;
