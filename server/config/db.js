const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
require("dotenv").config();

let activePool = null;

// Create pg-mem fallback database
function createInMemoryDb() {
  const { newDb, DataType } = require("pg-mem");
  const db = newDb();

  db.public.registerFunction({
    name: "gen_random_uuid",
    returns: DataType.text,
    implementation: () => crypto.randomUUID(),
  });

  db.public.registerFunction({
    name: "now",
    returns: DataType.timestamp,
    implementation: () => new Date(),
  });

  db.public.none(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(160) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'customer',
      phone VARCHAR(20),
      avatar_url TEXT,
      reset_token TEXT,
      reset_token_expires TIMESTAMP,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS addresses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      label VARCHAR(40) DEFAULT 'Home',
      line1 VARCHAR(200) NOT NULL,
      line2 VARCHAR(200),
      city VARCHAR(80) NOT NULL,
      state VARCHAR(80) NOT NULL,
      pincode VARCHAR(12) NOT NULL,
      lat DOUBLE PRECISION,
      lng DOUBLE PRECISION,
      is_default BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name VARCHAR(80) UNIQUE NOT NULL,
      slug VARCHAR(80) UNIQUE NOT NULL,
      image TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name VARCHAR(160) NOT NULL,
      slug VARCHAR(160),
      description TEXT,
      sku VARCHAR(60),
      price NUMERIC(10,2) NOT NULL,
      old_price NUMERIC(10,2),
      unit VARCHAR(40) DEFAULT '1 unit',
      stock INTEGER NOT NULL DEFAULT 0,
      sold_count INTEGER NOT NULL DEFAULT 0,
      rating NUMERIC(2,1) DEFAULT 4.5,
      category_id TEXT,
      images TEXT[],
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id TEXT PRIMARY KEY,
      code VARCHAR(30) UNIQUE NOT NULL,
      type VARCHAR(20) NOT NULL,
      value NUMERIC(10,2) NOT NULL,
      min_order_value NUMERIC(10,2) DEFAULT 0,
      max_discount NUMERIC(10,2),
      usage_limit INTEGER,
      used_count INTEGER NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT true,
      expires_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS delivery_partners (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      vehicle_type VARCHAR(30),
      vehicle_number VARCHAR(30),
      is_available BOOLEAN NOT NULL DEFAULT true,
      current_lat DOUBLE PRECISION,
      current_lng DOUBLE PRECISION,
      total_deliveries INTEGER NOT NULL DEFAULT 0,
      rating NUMERIC(2,1) DEFAULT 5.0,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      address_id TEXT,
      delivery_partner_id TEXT,
      coupon_id TEXT,
      delivery_slot VARCHAR(60),
      subtotal NUMERIC(10,2) NOT NULL,
      discount NUMERIC(10,2) NOT NULL DEFAULT 0,
      delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
      total NUMERIC(10,2) NOT NULL,
      payment_method VARCHAR(20) NOT NULL,
      payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
      status VARCHAR(20) NOT NULL DEFAULT 'placed',
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price NUMERIC(10,2) NOT NULL
    );
  `);

  const { Pool: MemPool } = db.adapters.createPg();
  return new MemPool();
}

async function getOrCreateUser(poolInstance, name, email, passwordHash, role, phone = null) {
  const existing = await poolInstance.query("SELECT * FROM users WHERE email = $1", [email]);
  if (existing.rows.length > 0) return existing.rows[0];

  const newId = crypto.randomUUID();
  const inserted = await poolInstance.query(
    `INSERT INTO users (id, name, email, password_hash, role, phone)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [newId, name, email, passwordHash, role, phone]
  );
  return inserted.rows[0];
}

async function seedInitialData(poolInstance) {
  try {
    const adminHash = await bcrypt.hash("Admin@12345", 10);
    const customerHash = await bcrypt.hash("User@12345", 10);
    const deliveryHash = await bcrypt.hash("Delivery@12345", 10);

    // 1. Users
    const adminUser = await getOrCreateUser(poolInstance, "Platform Admin", "admin@farmly.app", adminHash, "admin");
    const custUser = await getOrCreateUser(poolInstance, "Demo Customer", "customer@farmly.app", customerHash, "customer", "+1234567890");
    const delivUser = await getOrCreateUser(poolInstance, "Express Delivery", "delivery@farmly.app", deliveryHash, "delivery_partner", "+1987654321");

    // Address
    const existingAddr = await poolInstance.query("SELECT * FROM addresses WHERE user_id = $1", [custUser.id]);
    if (existingAddr.rows.length === 0) {
      await poolInstance.query(
        `INSERT INTO addresses (id, user_id, label, line1, line2, city, state, pincode, is_default)
         VALUES ($1, $2, 'Home', '123 Green Avenue', 'Apt 4B', 'New York', 'NY', '10001', true)`,
        [crypto.randomUUID(), custUser.id]
      );
    }

    // Delivery Partner
    const existingDP = await poolInstance.query("SELECT * FROM delivery_partners WHERE user_id = $1", [delivUser.id]);
    if (existingDP.rows.length === 0) {
      await poolInstance.query(
        `INSERT INTO delivery_partners (id, user_id, vehicle_type, vehicle_number, is_available)
         VALUES ($1, $2, 'Electric Scooter', 'NY-EV-908', true)`,
        [crypto.randomUUID(), delivUser.id]
      );
    }

    // 2. Categories
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

    const categoryIds = {};
    for (const cat of categories) {
      const existingCat = await poolInstance.query("SELECT id FROM categories WHERE name = $1", [cat.name]);
      if (existingCat.rows.length > 0) {
        categoryIds[cat.name] = existingCat.rows[0].id;
      } else {
        const catId = crypto.randomUUID();
        const inserted = await poolInstance.query(
          "INSERT INTO categories (id, name, slug) VALUES ($1, $2, $3) RETURNING id",
          [catId, cat.name, cat.slug]
        );
        categoryIds[cat.name] = inserted.rows[0].id;
      }
    }

    // 3. Products
    const products = [
      ["Organic Vine Tomatoes", "Vegetables", 89, 120, "500g pack", 40, "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500"],
      ["Fresh Hass Avocados", "Fruits", 149, 180, "Pack of 4", 30, "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500"],
      ["Sourdough Bread Loaf", "Bakery", 129, 150, "400g", 25, "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=500"],
      ["Farm Fresh Whole Milk", "Dairy", 65, 75, "1 Litre", 60, "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500"],
      ["Cold Pressed Orange Juice", "Beverages", 110, 140, "1 Litre", 35, "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500"],
      ["Organic Baby Spinach", "Organic", 45, 60, "200g", 20, "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500"],
      ["Belgian Dark Chocolate", "Snacks", 199, 240, "100g", 50, "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=500"],
      ["Frozen Mixed Berries", "Frozen Foods", 175, 210, "500g", 15, "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500"],
    ];

    for (const [name, category, price, oldPrice, unit, stock, img] of products) {
      const existingProd = await poolInstance.query("SELECT id FROM products WHERE name = $1", [name]);
      if (existingProd.rows.length === 0) {
        const catId = categoryIds[category];
        await poolInstance.query(
          `INSERT INTO products (id, name, category_id, price, old_price, unit, stock, images)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [crypto.randomUUID(), name, catId, price, oldPrice, unit, stock, [img]]
        );
      }
    }

    // 4. Coupons
    const existingCoupon = await poolInstance.query("SELECT id FROM coupons WHERE code = $1", ["WELCOME15"]);
    if (existingCoupon.rows.length === 0) {
      await poolInstance.query(
        `INSERT INTO coupons (id, code, type, value, min_order_value, max_discount, usage_limit)
         VALUES ($1, 'WELCOME15', 'percentage', 15, 200, 100, 1000)`,
        [crypto.randomUUID()]
      );
    }

    console.log("✔ In-memory database seeded successfully with Admin, Customer, Delivery & Catalog.");
  } catch (err) {
    console.error("Error seeding initial DB data:", err);
  }
}

let seedPromise = null;

async function initDb() {
  if (process.env.DATABASE_URL) {
    try {
      const pgPool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 2000 });
      await pgPool.query("SELECT 1");
      console.log("✔ Connected to PostgreSQL database.");
      activePool = pgPool;
      return;
    } catch (err) {
      console.warn("PostgreSQL connection failed, using in-memory database fallback:", err.message);
    }
  }

  activePool = createInMemoryDb();
  await seedInitialData(activePool);
}

seedPromise = initDb();

const query = async (text, params) => {
  if (seedPromise) {
    await seedPromise;
  }
  return activePool.query(text, params);
};

module.exports = { get pool() { return activePool; }, query };
