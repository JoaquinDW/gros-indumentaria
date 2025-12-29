-- Migration: Add support for multiple product images (max 5)
-- This script adds a new JSONB column to store multiple image URLs

-- Add new column for multiple images (array of URLs)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::JSONB;

-- Migrate existing image_url data to images array
-- If image_url exists, move it to the first position of the images array
UPDATE products
SET images = jsonb_build_array(image_url)
WHERE image_url IS NOT NULL AND image_url != '';

-- Add comment to document the column
COMMENT ON COLUMN products.images IS 'Array of image URLs for the product (max 5 images). Format: ["url1", "url2", ...]';

-- Optional: Keep image_url for backward compatibility or remove it
-- For now, we'll keep it as the primary/first image for legacy support
-- Uncomment the following line if you want to remove the old column:
-- ALTER TABLE products DROP COLUMN image_url;

-- Create a function to ensure max 5 images
CREATE OR REPLACE FUNCTION check_product_images_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF jsonb_array_length(NEW.images) > 5 THEN
    RAISE EXCEPTION 'Un producto no puede tener más de 5 imágenes';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce the limit
DROP TRIGGER IF EXISTS enforce_product_images_limit ON products;
CREATE TRIGGER enforce_product_images_limit
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION check_product_images_limit();

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_products_images ON products USING GIN (images);
