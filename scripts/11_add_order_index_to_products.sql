-- Add order_index column to products table for drag and drop ordering
ALTER TABLE products ADD COLUMN IF NOT EXISTS order_index INT DEFAULT 0;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_products_active_order ON products(active, order_index);

-- Update existing products with sequential order_index values based on creation date
WITH numbered_products AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) - 1 AS row_num
  FROM products
)
UPDATE products
SET order_index = numbered_products.row_num
FROM numbered_products
WHERE products.id = numbered_products.id
  AND products.order_index = 0;
