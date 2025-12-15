-- Update RLS policies for products table to allow admin operations

-- RLS Policy - authenticated users (admins) can insert products
CREATE POLICY "Authenticated users can insert products" ON products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policy - authenticated users (admins) can update products
CREATE POLICY "Authenticated users can update products" ON products
  FOR UPDATE USING (auth.role() = 'authenticated');

-- RLS Policy - authenticated users (admins) can delete products
CREATE POLICY "Authenticated users can delete products" ON products
  FOR DELETE USING (auth.role() = 'authenticated');

-- Note: The existing SELECT policy allows public to view only active products
-- Admins will be able to see all products (including inactive) through their authenticated queries
