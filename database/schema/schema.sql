-- =========================================================
-- Farmly Grocery Platform — PostgreSQL Schema
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ---------- USERS ----------
CREATE TABLE IF NOT EXISTS users (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                VARCHAR(120) NOT NULL,
  email               VARCHAR(160) UNIQUE NOT NULL,
  password_hash       TEXT NOT NULL,
  role                VARCHAR(20) NOT NULL DEFAULT 'customer'
                        CHECK (role IN ('customer', 'admin', 'delivery_partner')),
  phone               VARCHAR(20),
  avatar_url          TEXT,
  reset_token         TEXT,
  reset_token_expires TIMESTAMPTZ,
  is_active           BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ---------- ADDRESSES ----------
CREATE TABLE IF NOT EXISTS addresses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label       VARCHAR(40) DEFAULT 'Home',
  line1       VARCHAR(200) NOT NULL,
  line2       VARCHAR(200),
  city        VARCHAR(80) NOT NULL,
  state       VARCHAR(80) NOT NULL,
  pincode     VARCHAR(12) NOT NULL,
  lat         DOUBLE PRECISION,
  lng         DOUBLE PRECISION,
  is_default  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);

-- ---------- CATEGORIES ----------
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(80) UNIQUE NOT NULL,
  slug        VARCHAR(80) UNIQUE NOT NULL,
  image       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------- PRODUCTS ----------
CREATE TABLE IF NOT EXISTS products (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(160) NOT NULL,
  slug         VARCHAR(160),
  description  TEXT,
  sku          VARCHAR(60) UNIQUE,
  price        NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  old_price    NUMERIC(10,2),
  unit         VARCHAR(40) DEFAULT '1 unit',
  stock        INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  sold_count   INTEGER NOT NULL DEFAULT 0,
  rating       NUMERIC(2,1) DEFAULT 0,
  category_id  UUID REFERENCES categories(id) ON DELETE SET NULL,
  images       TEXT[] DEFAULT '{}',
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin (name gin_trgm_ops);

-- ---------- INVENTORY LOG ----------
CREATE TABLE IF NOT EXISTS inventory_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  change_qty  INTEGER NOT NULL,
  reason      VARCHAR(60) NOT NULL, -- restock, sale, adjustment, return
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------- COUPONS ----------
CREATE TABLE IF NOT EXISTS coupons (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code             VARCHAR(30) UNIQUE NOT NULL,
  type             VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'flat')),
  value            NUMERIC(10,2) NOT NULL,
  min_order_value  NUMERIC(10,2) DEFAULT 0,
  max_discount     NUMERIC(10,2),
  usage_limit      INTEGER,
  used_count       INTEGER NOT NULL DEFAULT 0,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  expires_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------- DELIVERY PARTNERS ----------
CREATE TABLE IF NOT EXISTS delivery_partners (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_type      VARCHAR(30),
  vehicle_number    VARCHAR(30),
  is_available      BOOLEAN NOT NULL DEFAULT false,
  current_lat       DOUBLE PRECISION,
  current_lng       DOUBLE PRECISION,
  total_deliveries  INTEGER NOT NULL DEFAULT 0,
  rating            NUMERIC(2,1) DEFAULT 5.0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------- ORDERS ----------
CREATE TABLE IF NOT EXISTS orders (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES users(id),
  address_id            UUID REFERENCES addresses(id),
  delivery_partner_id   UUID REFERENCES delivery_partners(id),
  coupon_id             UUID REFERENCES coupons(id),
  delivery_slot         VARCHAR(60),
  subtotal              NUMERIC(10,2) NOT NULL,
  discount              NUMERIC(10,2) NOT NULL DEFAULT 0,
  delivery_fee          NUMERIC(10,2) NOT NULL DEFAULT 0,
  total                 NUMERIC(10,2) NOT NULL,
  payment_method        VARCHAR(20) NOT NULL CHECK (payment_method IN ('card', 'cod', 'wallet')),
  payment_status        VARCHAR(20) NOT NULL DEFAULT 'pending'
                           CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  status                VARCHAR(20) NOT NULL DEFAULT 'placed'
                           CHECK (status IN
                             ('placed', 'confirmed', 'assigned', 'preparing',
                              'out_for_delivery', 'delivered', 'cancelled')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_partner ON orders(delivery_partner_id);

-- ---------- ORDER ITEMS ----------
CREATE TABLE IF NOT EXISTS order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id),
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  unit_price  NUMERIC(10,2) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ---------- PAYMENTS ----------
CREATE TABLE IF NOT EXISTS payments (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id           UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  stripe_intent_id   VARCHAR(120),
  amount             NUMERIC(10,2) NOT NULL,
  currency           VARCHAR(10) NOT NULL DEFAULT 'inr',
  status             VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------- REVIEWS ----------
CREATE TABLE IF NOT EXISTS reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id    UUID REFERENCES orders(id),
  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, user_id, order_id)
);

-- ---------- WISHLIST ----------
CREATE TABLE IF NOT EXISTS wishlist_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

-- ---------- NOTIFICATIONS ----------
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(160) NOT NULL,
  message     TEXT,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- ---------- ACTIVITY LOGS ----------
CREATE TABLE IF NOT EXISTS activity_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  action      VARCHAR(80) NOT NULL,
  meta        JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------- updated_at trigger helper ----------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
