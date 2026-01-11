-- Add image positioning fields to products table
-- This allows admins to set how images are displayed (position and scale)

-- Add image_positions column to store positioning data for each image
ALTER TABLE products
ADD COLUMN IF NOT EXISTS image_positions JSONB DEFAULT '[]';

-- Add comment explaining the structure
COMMENT ON COLUMN products.image_positions IS
'Array of positioning objects for each image. Structure: [{ x: number (0-100), y: number (0-100), scale: number (1-2) }]. Index matches images array.';

-- Example update to set default positioning for existing products
-- This ensures existing products have default centered positioning
UPDATE products
SET image_positions = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'x', 50,
      'y', 50,
      'scale', 1
    )
  )
  FROM generate_series(1, COALESCE(jsonb_array_length(images), 1))
)
WHERE image_positions = '[]' AND images IS NOT NULL;
