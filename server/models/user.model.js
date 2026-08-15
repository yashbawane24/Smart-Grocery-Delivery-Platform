const { query } = require("../config/db");

const UserModel = {
  async create({ name, email, passwordHash, role = "customer" }) {
    const { rows } = await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email, passwordHash, role]
    );
    return rows[0];
  },

  async findByEmail(email) {
    const { rows } = await query("SELECT * FROM users WHERE LOWER(email) = LOWER($1)", [email]);
    return rows[0];
  },

  async findById(id) {
    const { rows } = await query(
      "SELECT id, name, email, role, avatar_url, phone, created_at FROM users WHERE id = $1",
      [id]
    );
    return rows[0];
  },

  async updateProfile(id, { name, phone, avatarUrl }) {
    const { rows } = await query(
      `UPDATE users SET
         name = COALESCE($2, name),
         phone = COALESCE($3, phone),
         avatar_url = COALESCE($4, avatar_url),
         updated_at = NOW()
       WHERE id = $1
       RETURNING id, name, email, role, avatar_url, phone`,
      [id, name, phone, avatarUrl]
    );
    return rows[0];
  },

  async setResetToken(id, token, expiresAt) {
    await query(
      "UPDATE users SET reset_token = $2, reset_token_expires = $3 WHERE id = $1",
      [id, token, expiresAt]
    );
  },

  async findByResetToken(token) {
    const { rows } = await query(
      "SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()",
      [token]
    );
    return rows[0];
  },

  async updatePassword(id, passwordHash) {
    await query(
      `UPDATE users SET password_hash = $2, reset_token = NULL,
       reset_token_expires = NULL, updated_at = NOW() WHERE id = $1`,
      [id, passwordHash]
    );
  },
};

module.exports = UserModel;
