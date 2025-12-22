-- Add fabrics column to products table
-- This allows admins to specify available fabric types for each product
-- Fabrics are stored as a JSONB array of strings (e.g., ["Algodón", "Poliéster", "Lycra"])

ALTER TABLE products
ADD COLUMN fabrics JSONB DEFAULT '[]'::JSONB;

-- Add comment to document the column
COMMENT ON COLUMN products.fabrics IS 'Array of available fabric types for this product (e.g., ["Algodón", "Poliéster", "Lycra"])';

-- Optional: Update existing products with some default fabric types
-- Uncomment and modify as needed based on your product categories
/*
UPDATE products
SET fabrics = '["Algodón", "Poliéster"]'::JSONB
WHERE category = 'Remeras' AND fabrics = '[]'::JSONB;

UPDATE products
SET fabrics = '["Algodón", "Frisa"]'::JSONB
WHERE category = 'Buzos' AND fabrics = '[]'::JSONB;

UPDATE products
SET fabrics = '["Lycra", "Poliéster"]'::JSONB
WHERE category = 'Calzas' AND fabrics = '[]'::JSONB;

UPDATE products
SET fabrics = '["Nylon", "Poliéster"]'::JSONB
WHERE category = 'Camperas' AND fabrics = '[]'::JSONB;
*/
