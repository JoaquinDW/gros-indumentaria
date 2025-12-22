-- Script 09: Create clubs and club_products tables
-- This script creates tables for managing sports clubs and their associated products

-- Create clubs table
CREATE TABLE IF NOT EXISTS clubs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR NOT NULL,
  slug VARCHAR NOT NULL UNIQUE,
  description TEXT,
  logo_url VARCHAR,
  order_index INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create club_products junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS club_products (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  club_id BIGINT NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(club_id, product_id)
);

-- Enable Row Level Security
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clubs table

-- Public can view active clubs
DROP POLICY IF EXISTS "Clubs are viewable by everyone" ON clubs;
CREATE POLICY "Clubs are viewable by everyone" ON clubs
  FOR SELECT USING (active = true);

-- Authenticated users can view all clubs (including inactive)
DROP POLICY IF EXISTS "Authenticated users can view all clubs" ON clubs;
CREATE POLICY "Authenticated users can view all clubs" ON clubs
  FOR SELECT USING (auth.role() = 'authenticated');

-- Authenticated users can insert clubs
DROP POLICY IF EXISTS "Authenticated users can insert clubs" ON clubs;
CREATE POLICY "Authenticated users can insert clubs" ON clubs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update clubs
DROP POLICY IF EXISTS "Authenticated users can update clubs" ON clubs;
CREATE POLICY "Authenticated users can update clubs" ON clubs
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Authenticated users can delete clubs
DROP POLICY IF EXISTS "Authenticated users can delete clubs" ON clubs;
CREATE POLICY "Authenticated users can delete clubs" ON clubs
  FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for club_products table

-- Public can view club-product associations
DROP POLICY IF EXISTS "Club products are viewable by everyone" ON club_products;
CREATE POLICY "Club products are viewable by everyone" ON club_products
  FOR SELECT USING (TRUE);

-- Authenticated users can manage club products
DROP POLICY IF EXISTS "Authenticated users can insert club products" ON club_products;
CREATE POLICY "Authenticated users can insert club products" ON club_products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update club products" ON club_products;
CREATE POLICY "Authenticated users can update club products" ON club_products
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete club products" ON club_products;
CREATE POLICY "Authenticated users can delete club products" ON club_products
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clubs_active_order ON clubs(active, order_index);
CREATE INDEX IF NOT EXISTS idx_clubs_slug ON clubs(slug);
CREATE INDEX IF NOT EXISTS idx_club_products_club_id ON club_products(club_id);
CREATE INDEX IF NOT EXISTS idx_club_products_product_id ON club_products(product_id);

-- Add updated_at trigger for clubs table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_clubs_updated_at ON clubs;
CREATE TRIGGER update_clubs_updated_at
  BEFORE UPDATE ON clubs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some example clubs (optional - can be removed if you want to add them manually)
INSERT INTO clubs (name, slug, description, order_index, active) VALUES
  ('DEPOR GARCITAS', 'depor-garcitas', 'Club deportivo de la zona', 1, true),
  ('UNIÓN MACHAGAI', 'union-machagai', 'Club tradicional de Machagai', 2, true)
ON CONFLICT (slug) DO NOTHING;
