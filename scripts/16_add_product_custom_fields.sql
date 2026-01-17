-- Add custom field toggles to products table
-- These fields allow enabling/disabling name and number inputs during purchase

-- Add name_field_enabled column (allows customer to input name for personalization)
ALTER TABLE products
ADD COLUMN name_field_enabled BOOLEAN DEFAULT FALSE NOT NULL;

-- Add number_field_enabled column (allows customer to input number for personalization)
ALTER TABLE products
ADD COLUMN number_field_enabled BOOLEAN DEFAULT FALSE NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN products.name_field_enabled IS 'When true, customers must provide a name field during purchase (e.g., name to print on garment)';
COMMENT ON COLUMN products.number_field_enabled IS 'When true, customers must provide a number field during purchase (e.g., number to print on garment)';
