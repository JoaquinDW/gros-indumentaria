-- Update fabrics column to support pricing structure
-- This script modifies the fabrics column to store fabric names with their respective prices

-- Drop the existing fabrics column
ALTER TABLE products DROP COLUMN IF EXISTS fabrics;

-- Add new fabrics column as JSONB to store fabric-price mapping
-- Format: {"Algodón": 2500, "Poliéster": 3000, "Lycra": 3500}
ALTER TABLE products ADD COLUMN fabrics JSONB DEFAULT '{}'::JSONB;

-- Add comment to document the structure
COMMENT ON COLUMN products.fabrics IS 'JSONB object mapping fabric types to prices, e.g., {"Algodón": 2500, "Poliéster": 3000}';

-- Drop the colors column as it's no longer needed
ALTER TABLE products DROP COLUMN IF EXISTS colors;

-- Add comment to document that colors are removed
COMMENT ON TABLE products IS 'Products table - colors removed, fabrics now include pricing';
