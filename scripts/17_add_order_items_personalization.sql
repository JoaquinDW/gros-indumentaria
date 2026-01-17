-- Add personalization fields to order_items table
-- These fields store the customer-provided name and number for each order item

-- Add personalization_name column (stores the name provided by customer)
ALTER TABLE order_items
ADD COLUMN personalization_name VARCHAR;

-- Add personalization_number column (stores the number provided by customer)
ALTER TABLE order_items
ADD COLUMN personalization_number VARCHAR;

-- Add comments for documentation
COMMENT ON COLUMN order_items.personalization_name IS 'Customer-provided name for personalization (e.g., name to print on garment)';
COMMENT ON COLUMN order_items.personalization_number IS 'Customer-provided number for personalization (e.g., number to print on garment)';
