-- Update RLS policies for products table to allow admin operations

-- RLS Policy - authenticated users (admins) can view ALL products (including inactive)
CREATE POLICY "Authenticated users can view all products" ON products
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = (SELECT auth.uid()) AND role = 'admin'));

-- RLS Policy - authenticated users (admins) can insert products
CREATE POLICY "Authenticated users can insert products" ON products
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = (SELECT auth.uid()) AND role = 'admin'));

-- RLS Policy - authenticated users (admins) can update products
CREATE POLICY "Authenticated users can update products" ON products
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = (SELECT auth.uid()) AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = (SELECT auth.uid()) AND role = 'admin'));

-- RLS Policy - authenticated users (admins) can delete products
CREATE POLICY "Authenticated users can delete products" ON products
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = (SELECT auth.uid()) AND role = 'admin'));

-- Note: The existing "Products are viewable by everyone" policy allows public to view only active products
-- The new "Authenticated users can view all products" policy allows admins to see both active and inactive products
