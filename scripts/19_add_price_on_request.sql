-- Migration: Add price_on_request field to products table
-- This allows products to be marked as "price on request" where customers must request a quote

-- Add the price_on_request column
ALTER TABLE products
ADD COLUMN price_on_request BOOLEAN DEFAULT FALSE NOT NULL;

-- Make price nullable to allow NULL when price_on_request is true
ALTER TABLE products
ALTER COLUMN price DROP NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN products.price_on_request IS 'When true, price is not displayed publicly and customers must request a quote';

-- Update existing products to ensure they have a valid state
-- Products with a price should have price_on_request = false
UPDATE products
SET price_on_request = false
WHERE price IS NOT NULL AND price > 0;
