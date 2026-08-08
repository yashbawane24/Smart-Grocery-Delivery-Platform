// Seeds the database with sample data for local development and demos.
// Usage: node database/seed/seed.js
const path = require("path");
const serverModules = (pkg) => require(path.join(__dirname, "../../server/node_modules", pkg));

serverModules("dotenv").config({ path: path.join(__dirname, "../../server/.env") });
const bcrypt = serverModules("bcryptjs");
const { Pool } = serverModules("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const categories = [
  { name: "Vegetables", slug: "vegetables" },
  { name: "Fruits", slug: "fruits" },
  { name: "Bakery", slug: "bakery" },
  { name: "Snacks", slug: "snacks" },
  { name: "Dairy", slug: "dairy" },
  { name: "Frozen Foods", slug: "frozen-foods" },
  { name: "Organic", slug: "organic" },
  { name: "Beverages", slug: "beverages" },
];

async function seed() {
  const client = await pool.connect();
  try {
    console.log("Seeding admin user...");
    const passwordHash = await bcrypt.hash("Admin@12345", 12);
    await client.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ('Platform Admin', 'admin@farmly.app', $1, 'admin')
       ON CONFLICT (email) DO NOTHING`,
      [passwordHash]
    );

    console.log("Seeding categories...");
    const categoryIds = {};
    for (const cat of categories) {
      const { rows } = await client.query(
        `INSERT INTO categories (name, slug)
         VALUES ($1, $2)
         ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug
         RETURNING id, name`,
        [cat.name, cat.slug]
      );
      categoryIds[cat.name] = rows[0].id;
    }

    console.log("Seeding sample products...");
    const products = [
      ["Organic Vine Tomatoes", "Vegetables", 89, 120, "500g pack", 40],
      ["Fresh Hass Avocados", "Fruits", 149, 180, "Pack of 4", 30],
      ["Sourdough Bread Loaf", "Bakery", 129, 150, "400g", 25],
      ["Farm Fresh Whole Milk", "Dairy", 65, 75, "1 Litre", 60],
      ["Cold Pressed Orange Juice", "Beverages", 110, 140, "1 Litre", 35],
      ["Organic Baby Spinach", "Organic", 45, 60, "200g", 20],
      ["Belgian Dark Chocolate", "Snacks", 199, 240, "100g", 50],
      ["Frozen Mixed Berries", "Frozen Foods", 175, 210, "500g", 15],
    ];

    for (const [name, category, price, oldPrice, unit, stock] of products) {
      await client.query(
        `INSERT INTO products (name, category_id, price, old_price, unit, stock)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING`,
        [name, categoryIds[category], price, oldPrice, unit, stock]
      );
    }

    console.log("Seeding welcome coupon...");
    await client.query(
      `INSERT INTO coupons (code, type, value, min_order_value, max_discount, usage_limit)
       VALUES ('WELCOME15', 'percentage', 15, 200, 100, 1000)
       ON CONFLICT (code) DO NOTHING`
    );

    console.log("✔ Seed complete.");
  } catch (err) {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
