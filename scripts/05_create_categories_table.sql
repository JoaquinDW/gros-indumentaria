-- Create categories table for product categorization
CREATE TABLE IF NOT EXISTS categories (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR NOT NULL UNIQUE,
  description TEXT,
  image_url VARCHAR,
  order_index INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- RLS Policy - public can view active categories
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT TO anon, authenticated USING (active = true);

-- RLS Policy - authenticated users (admins) can insert categories
CREATE POLICY "Authenticated users can insert categories" ON categories
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = (SELECT auth.uid()) AND role = 'admin')
  );

-- RLS Policy - authenticated users (admins) can update categories
CREATE POLICY "Authenticated users can update categories" ON categories
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = (SELECT auth.uid()) AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = (SELECT auth.uid()) AND role = 'admin'));

-- RLS Policy - authenticated users (admins) can delete categories
CREATE POLICY "Authenticated users can delete categories" ON categories
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = (SELECT auth.uid()) AND role = 'admin'));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_categories_active_order ON categories(active, order_index);

-- Insert existing hardcoded categories
INSERT INTO categories (name, description, order_index, active) VALUES
  ('Remeras', 'Remeras y camisetas', 1, true),
  ('Buzos', 'Buzos y sweaters', 2, true),
  ('Calzas', 'Calzas deportivas', 3, true),
  ('Camperas', 'Camperas y abrigos', 4, true)
ON CONFLICT (name) DO NOTHING;
