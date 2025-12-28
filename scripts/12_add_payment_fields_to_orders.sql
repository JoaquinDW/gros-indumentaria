-- Add payment-related fields to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS mercado_pago_payment_id VARCHAR,
ADD COLUMN IF NOT EXISTS payment_status VARCHAR DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_status_detail VARCHAR,
ADD COLUMN IF NOT EXISTS external_reference VARCHAR,
ADD COLUMN IF NOT EXISTS transaction_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS delivery_method VARCHAR DEFAULT 'correo',
ADD COLUMN IF NOT EXISTS club_id BIGINT REFERENCES clubs(id),
ADD COLUMN IF NOT EXISTS fabric VARCHAR;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_mp_payment_id ON orders(mercado_pago_payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_external_ref ON orders(external_reference);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Add comment to explain the fields
COMMENT ON COLUMN orders.mercado_pago_payment_id IS 'Mercado Pago payment ID from webhook';
COMMENT ON COLUMN orders.payment_status IS 'Payment status: pending, approved, rejected, cancelled, refunded';
COMMENT ON COLUMN orders.external_reference IS 'External reference from Mercado Pago preference (ORDER-timestamp)';
COMMENT ON COLUMN orders.transaction_amount IS 'Actual amount charged by Mercado Pago';
COMMENT ON COLUMN orders.delivery_method IS 'Delivery method: correo or club';
COMMENT ON COLUMN orders.club_id IS 'Club ID if delivery method is club pickup';
