-- Update RLS policies for products table to allow admin operations

-- RLS Policy - authenticated users (admins) can view ALL products (including inactive)
CREATE POLICY "Authenticated users can view all products" ON products
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policy - authenticated users (admins) can insert products
CREATE POLICY "Authenticated users can insert products" ON products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policy - authenticated users (admins) can update products
CREATE POLICY "Authenticated users can update products" ON products
  FOR UPDATE USING (auth.role() = 'authenticated');

-- RLS Policy - authenticated users (admins) can delete products
CREATE POLICY "Authenticated users can delete products" ON products
  FOR DELETE USING (auth.role() = 'authenticated');

-- Note: The existing "Products are viewable by everyone" policy allows public to view only active products
-- The new "Authenticated users can view all products" policy allows admins to see both active and inactive products
