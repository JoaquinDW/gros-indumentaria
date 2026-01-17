-- Add locality field to orders table
-- This migration adds customer_locality to store the locality from Georef API

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS customer_locality VARCHAR(255);

-- Add comment to the column
COMMENT ON COLUMN orders.customer_locality IS 'Customer locality/city from Georef API';
