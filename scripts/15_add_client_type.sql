-- Add client_type column to clubs table to differentiate between clubs and organizations
-- clubs: have dedicated pages with products
-- organization: only display logos in "Nuestros Clientes" section, no dedicated pages

-- Add client_type column with default value 'club' for existing records
ALTER TABLE clubs
ADD COLUMN client_type VARCHAR(50) DEFAULT 'club' NOT NULL;

-- Add check constraint to ensure only valid values
ALTER TABLE clubs
ADD CONSTRAINT clubs_client_type_check
CHECK (client_type IN ('club', 'organization'));

-- Create index for better query performance when filtering by type
CREATE INDEX idx_clubs_client_type ON clubs(client_type);

-- Comment on the column for documentation
COMMENT ON COLUMN clubs.client_type IS 'Type of client: club (has dedicated page) or organization (logo only)';
