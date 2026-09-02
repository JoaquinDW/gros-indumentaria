-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR NOT NULL,
  category VARCHAR NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR,
  sizes JSONB DEFAULT '[]'::JSONB,
  colors JSONB DEFAULT '[]'::JSONB,
  active BOOLEAN DEFAULT TRUE,
  lead_time VARCHAR DEFAULT '7-10 días',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  order_number VARCHAR UNIQUE NOT NULL,
  customer_name VARCHAR NOT NULL,
  customer_email VARCHAR NOT NULL,
  customer_phone VARCHAR,
  customer_address TEXT,
  customer_province VARCHAR,
  items JSONB NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR DEFAULT 'pending',
  payment_method VARCHAR DEFAULT 'mercado_pago',
  mercado_pago_preference_id VARCHAR,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create order items table
CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id),
  quantity INT NOT NULL,
  size VARCHAR,
  color VARCHAR,
  customization_text VARCHAR,
  unit_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL UNIQUE,
  email VARCHAR NOT NULL UNIQUE,
  role VARCHAR DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products (public read)
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT TO anon, authenticated USING (active = true);

-- Orders, order_items and admin_users intentionally have no public policies.
-- Server-side checkout/webhook code uses the service role; back-office access
-- is granted by the harden_admin_access migration after admin membership is
-- configured.

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
